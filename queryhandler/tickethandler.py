# -*- coding:utf-8 -*-
import random
import string
import datetime
from urlhandler.models import *
from queryhandler.settings import QRCODE_URL
from django.db.models import F
from django.db import transaction

from userpage.safe_reverse import *
from queryhandler.weixin_reply_templates import *
from queryhandler.weixin_text_templates import *
from queryhandler.handler_check_templates import *
from queryhandler.weixin_msg import *
from weixinlib.settings import WEIXIN_EVENT_KEYS
from weixinlib.custom_menu import modify_custom_menu
from weixinlib.settings import WEIXIN_CUSTOM_MENU_TEMPLATE
from weixinlib.custom_menu import get_custom_menu
import json


def get_user(openid):
    try:
        return User.objects.get(weixin_id=openid, status=1)
    except:
        return None


def get_reply_single_ticket(msg, ticket, now, ext_desc=''):
    return get_reply_single_news_xml(msg, get_item_dict(
        title=get_text_one_ticket_title(ticket, now),
        description=ext_desc + get_text_one_ticket_description(ticket, now),
        pic_url=get_text_ticket_pic(ticket),
        url=s_reverse_ticket_detail(ticket.unique_id)
    ))


def get_reply_multi_tickets(msg, tickets, now, ext_desc=''):
    articles = []
    for ticket in tickets:
        articles.append(get_item_dict(
            title=get_text_one_ticket_title(ticket, now),
            description=ext_desc + get_text_one_ticket_description(ticket, now),
            pic_url=get_text_ticket_pic(ticket),
            url=s_reverse_ticket_detail(ticket.unique_id)))
    return get_reply_news_xml(msg, articles)


#check user is authenticated or not
def is_authenticated(openid):
    return get_user(openid) is not None


#check help command
def check_help_or_subscribe(msg):
    #    print get_custom_menu()
    return handler_check_text(msg, ['帮助', 'help']) or handler_check_event_click(msg, [
        WEIXIN_EVENT_KEYS['help']]) or handler_check_events(msg, ['scan', 'subscribe'])


#get help information
def response_help_or_subscribe_response(msg):
    #去注释改菜单 modified by YY
    modify_custom_menu(json.dumps(WEIXIN_CUSTOM_MENU_TEMPLATE, ensure_ascii=False).encode('utf-8'))
    return get_reply_single_news_xml(msg, get_item_dict(
        title=get_text_help_title(),
        description=get_text_help_description(is_authenticated(get_msg_from(msg))),
        url=s_reverse_help()
    ))


#check book command
def check_bookable_activities(msg):
    return handler_check_text(msg, ['抢啥']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_book_what']])


#get bookable activities
def response_bookable_activities(msg):
    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities_book_not_end = Activity.objects.filter(status=1, book_end__gte=now).order_by('book_start')
    activities_book_end = Activity.objects.filter(status=1, book_end__lt=now, end_time__gte=now)
    activities = list(activities_book_not_end) + list(activities_book_end)
    if len(activities) == 1:
        activity = activities[0]
        return get_reply_single_news_xml(msg, get_item_dict(
            title=get_text_activity_title_with_status(activity, now),
            description=get_text_activity_description(activity, 100),
            pic_url=SITE_DOMAIN + activity.pic.url,
            url=s_reverse_activity_detail(activity.id)
        ))
    items = []
    for activity in activities:
        items.append(get_item_dict(
            title=get_text_activity_title_with_status(activity, now),
            pic_url=SITE_DOMAIN + activity.pic.url,
            url=s_reverse_activity_detail(activity.id)
        ))
        if len(items) >= 10:
            break
    if len(items) != 0:
        return get_reply_news_xml(msg, items)
    else:
        return get_reply_text_xml(msg, get_text_no_bookable_activity())


def check_exam_tickets(msg):
    return handler_check_text(msg, ['查票']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_get']])


#get list of tickets
def response_exam_tickets(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_exam_ticket(fromuser))

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gte=now)
    all_tickets = []
    tickets = Ticket.objects.filter(stu_id=user.stu_id, status=1)
    for ticket in tickets:
        if ticket.district.activity.end_time >= now:
            all_tickets.append(ticket)

    if len(all_tickets) == 1:
        ticket = all_tickets[0]
        return get_reply_single_ticket(msg, ticket, now)
    elif len(all_tickets) == 0:
        return get_reply_text_xml(msg, get_text_no_ticket())
    else:
        return get_reply_text_xml(msg, get_text_exam_tickets(all_tickets, now))


def check_fetch_ticket(msg):
    return handler_check_text_header(msg, ['取票'])


#handle order message
def response_fetch_ticket(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_fetch_ticket(fromuser))

    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_fetch_ticket())

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gt=now, book_start__lt=now, key=key)
    if not activities.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity('取票'))
    else:
        activity = activities[0]
    return fetch_ticket(msg, user, activity, now)


def fetch_ticket(msg, user, activity, now):
    tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activity, status=1)
    if tickets.exists():
        ticket = tickets[0]
        return get_reply_single_ticket(msg, ticket, now)
    else:
        return get_reply_text_xml(msg, get_text_no_ticket_in_act(activity, now))


def check_book_ticket(msg):
    return handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_book']])


def response_book_ticket(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_book_ticket(fromuser))
    if user.book_activity is None or user.book_district is None:
        return get_reply_text_xml(msg, get_text_user_not_set(fromuser))

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    districts = District.objects.filter(id=user.book_district.id)
    if not districts.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity('抢票'))
    district = districts[0]
    activity = district.activity
    if activity.book_start > now:
        return get_reply_text_xml(msg, get_text_book_ticket_future_with_hint(activity, now))
    elif activity.book_end <= now:
        return get_reply_text_xml(msg, get_text_book_ticket_past_with_hint(activity, now))
    else:
        tickets = Ticket.objects.filter(stu_id=user.stu_id, district=district, status__gt=0)
        if tickets.exists():
            return get_reply_text_xml(msg, get_text_existed_book_ticket(tickets[0]))
        #change to has_seat!!!
        if district.has_seat:
            mytickets = book_ticket_with_seats(user, district, now)
        else:
            mytickets = book_ticket(user, district, now)
        if mytickets is None:
            return get_reply_text_xml(msg, get_text_fail_book_ticket(activity, now))
        else:
            return get_reply_multi_tickets(msg, mytickets, now, get_text_success_book_ticket())


def book_ticket(user, district, now):
    with transaction.atomic():

        if district.remain_tickets <= 0:
            return None

        #? better return?
        tickets = Ticket.objects.select_for_update().filter(stu_id=user.stu_id, district=district, status=1)
        if tickets.exists():
            return None
        if user.need_multi_ticket:
            if district.remain_tickets <= 1:
                return None
            n = 2
        else:
            n = 1
        mytickets = []
        for i in range(0, n):
            random_string = ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(32)])
            while Ticket.objects.filter(unique_id=random_string).exists():
                random_string = ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(32)])
            District.objects.filter(id=district.id).update(remain_tickets=F('remain_tickets') - 1)
            ticket = Ticket.objects.create(
                stu_id=user.stu_id,
                district=district,
                unique_id=random_string,
                status=1,
                seat=None
            )
            mytickets.append(ticket)

        return mytickets


def check_cancel_ticket(msg):
    return handler_check_text_header(msg, ['退票'])


def response_cancel_ticket(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_cancel_ticket(fromuser))

    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_cancel_ticket())

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    tickets = Ticket.objects.filter(unique_id='hQeXPjqHVHx4DXMJjr2U6nAw1GxcVnJi')

    if not tickets.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity('退票'))
    else:
        ticket = tickets[0]
        if ticket.district.activity.book_end >= now:
            ticket.status = 0
            ticket.save()
            District.objects.filter(id=ticket.district.id).update(remain_tickets=F('remain_tickets') + 1)
            return get_reply_text_xml(msg, get_text_success_cancel_ticket())
        else:
            return get_reply_text_xml(msg, get_text_timeout_cancel_ticket())
            # if not activities.exists():
            #     return get_reply_text_xml(msg, get_text_no_such_activity('退票'))
            # else:
            #     activity = activities[0]
            #     if activity.book_end >= now:
            #         tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activity, status=1)
            #         if tickets.exists():   # user has already booked the activity
            #             ticket = tickets[0]
            #             ticket.status = 0
            #             ticket.save()
            #             Activity.objects.filter(id=activity.id).update(remain_tickets=F('remain_tickets')+1)
            #             return get_reply_text_xml(msg, get_text_success_cancel_ticket())
            #         else:
            #             return get_reply_text_xml(msg, get_text_fail_cancel_ticket())
            #     else:
            #         return get_reply_text_xml(msg, get_text_timeout_cancel_ticket())


#check book event
def check_book_event(msg):
    return handler_check_text_header(msg, ['抢票'])


#for test!!!
def response_book_event(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_book_ticket(fromuser))

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))

    activities = Activity.objects.filter(id=9, status=1)
    if activities.exists():
        activity = activities[0]
    else:
        return get_reply_text_xml(msg, get_text_no_such_activity())

    # if activity.book_start > now:
    #     return get_reply_text_xml(msg, get_text_book_ticket_future(activity, now))
    districts = District.objects.select_for_update().filter(activity=activity)
    district = districts[0]
    tickets = Ticket.objects.filter(stu_id=user.stu_id, district=district, status__gt=0)
    if tickets.exists():
        return get_reply_single_ticket(msg, tickets[0], now, get_text_existed_book_event())

    ticket = book_ticket(user, district, now)
    if ticket is None:
        return get_reply_text_xml(msg, get_text_fail_book_ticket(activities[0], now))
    else:
        return get_reply_single_ticket(msg, ticket[0], now, get_text_success_book_ticket())


#check unsubscribe event
def check_unsubscribe_or_unbind(msg):
    return handler_check_text(msg, ['解绑']) or handler_check_events(msg, ['unsubscribe'])


#handle unsubscribe event
def response_unsubscribe_or_unbind(msg):
    fromuser = get_msg_from(msg)
    User.objects.filter(weixin_id=fromuser, status=1).update(status=0)
    return get_reply_text_xml(msg, get_text_unbind_success(fromuser))


#check bind event
def check_bind_account(msg):
    return handler_check_text(msg, ['绑定']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['account_bind']])


#handle bind event
def response_bind_account(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_to_bind_account(fromuser))
    else:
        return get_reply_text_xml(msg, get_text_binded_account(user.stu_id))


def check_no_book_acts_event(msg):
    return handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_no_book_recommand']])


def response_no_book_acts(msg):
    return get_reply_text_xml(msg, get_text_hint_no_book_acts())


def check_get_activity_menu(msg):
    return handler_check_text_header(msg, ['节目单'])


def response_get_activity_menu(msg):
    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_get_activity_menu())

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gt=now, key=key)
    if not activities.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity())
    else:
        activity = activities[0]
    if not activity.menu_url:
        return get_reply_text_xml(msg, get_text_no_activity_menu())
    if activity.start_time > now:
        return get_reply_text_xml(msg, get_text_fail_get_activity_menu(activity, now))
    return get_reply_single_news_xml(msg, get_item_dict(
        title=get_text_title_activity_menu(activity),
        description=get_text_desc_activity_menu(activity),
        pic_url=activity.pic,
        url=s_reverse_activity_menu(activity.id)
    ))


def check_xnlhwh(msg):
    return handler_check_text(msg, ['xnlhwh'])


def response_xnlhwh(msg):
    msg['Content'] = '节目单 新年联欢晚会'
    return response_get_activity_menu(msg)


def check_setting(msg):
    return handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_setting']]) or handler_check_text(msg, ['设置'])


def response_setting(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_setting(fromuser))
    return get_reply_text_xml(msg, get_text_setting(fromuser))


max_cols = 0


def seat_cmp(a, b):
    global max_cols
    if a.row != b.row:
        return cmp(a.row, b.row)
    cola = int(abs(a.column - max_cols / 2))
    colb = int(abs(b.column - max_cols / 2))
    return cmp(cola, colb)


def get_seat_str(seat):
    return str(seat.row) + ',' + str(seat.column)


def arrange_seats(seats, user):
    seat_list = []
    global max_cols
    max_cols = 0
    for seat in seats:
        seat_list.append(seat)
        if seat.column > max_cols:
            max_cols = seat.column

    seat_list.sort(cmp=seat_cmp)

    abandon_seats = set(user.abandon_seats.split(';'))
    chosen_seats = []
    if user.need_multi_ticket:
        for seat1 in seat_list:
            if get_seat_str(seat1) in abandon_seats:
                continue
            if seat1.is_sold:
                continue
            for seat2 in seat_list:
                if seat1.row != seat2.row:
                    continue
                if abs(seat1.column - seat2.column) != 1:
                    continue
                if seat2.is_sold:
                    continue
                if get_seat_str(seat2) in abandon_seats:
                    continue
                chosen_seats = [seat1, seat2]
                return chosen_seats
    else:
        for seat in seat_list:
            if seat.is_sold:
                continue
            if get_seat_str(seat) not in abandon_seats:
                chosen_seats = [seat]
                break
    return chosen_seats


def book_ticket_with_seats(user, district, now):
    with transaction.atomic():
        if district.remain_tickets <= 0:
            return None

        seats = Seat.objects.select_for_update().filter(district=district, is_sold=False)
        if (not seats.exists()):
            return None

        #better return???
        tickets = Ticket.objects.select_for_update().filter(stu_id=user.stu_id, district=district, status=1)
        if tickets.exists():
            return None

        myseats = arrange_seats(seats, user)
        if myseats == None or myseats == []:
            return None
        tickets = []
        for seat in myseats:
            random_string = ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(32)])
            while Ticket.objects.filter(unique_id=random_string).exists():
                random_string = ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(32)])

            District.objects.filter(id=district.id).update(remain_tickets=F('remain_tickets') - 1)
            ticket = Ticket.objects.create(
                stu_id=user.stu_id,
                district=district,
                unique_id=random_string,
                status=1,
                seat=seat
            )
            Seat.objects.filter(id=seat.id).update(is_sold=True)
            tickets.append(ticket)
        return tickets

#modified by YY
def is_valid_vote(vote_key):
    act = VoteAct.objects.filter(key=vote_key)
    return act

def has_voted(stu_id, vote_id):
    record = VoteLog.objects.filter(stu_id=stu_id, activity_id=vote_id)
    if(len(record) != 0):
        return True
    return False

def check_vote(msg):
    #判断是否是以投票二字开头的信息
    #start_with_vote = (msg['Content'].lower()[:6] == '投票')
    return is_msgtype(msg, 'text') and (msg['Content'].lower()[:6] == '投票')

def response_vote(msg):
    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    #对投票操作作出回复
    #判断是否已绑定
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_vote(fromuser))

    #首先分割字符串，得到活动代码及候选人编号列表
    received_message = get_msg_content(msg).split()
    length = len(received_message)
    if length == 1:
        return get_reply_text_xml(msg, get_text_vote_help())

    vote_act = is_valid_vote(received_message[1])
    if(len(vote_act) == 0):
        return get_reply_text_xml(msg, get_text_vote_not_exist())

    vote_act = list(vote_act)[0]

    if(vote_act.end_vote < now):
        return get_reply_text_xml(msg, get_text_vote_end())

    if(has_voted(user.stu_id, vote_act.id)):
        return get_reply_text_xml(msg, get_text_already_vote())

    if length == 2:
        return get_reply_text_xml(msg, get_text_no_candidates_selected())

    n = vote_act.config
    if(length - 2 > vote_act.config):
        return get_reply_text_xml(msg, get_text_too_many_candidates_selected(vote_act.config))

    for n in range(2, length):
        cand = Candidate.objects.filter(activity_id=vote_act.id, key=int(received_message[n]))
        if(len(cand) == 0):
            return get_reply_text_xml(msg, get_text_invalid_candidates_selected())

    for n in range(2, length):
        cand = Candidate.objects.filter(activity_id=vote_act.id, key=int(received_message[n]))
        list(cand)[0].votes += 1
        list(cand)[0].save()

    preDict = dict()
    preDict['stu_id'] = user.stu_id
    preDict['activity_id'] = vote_act
    VoteLog.objects.create(**preDict)

    return get_reply_text_xml(msg, get_text_vote_succeed())

def check_vote_activities(msg):
    return handler_check_text(msg, ['投啥']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['vote_what']])

def response_vote_activities(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    vote_published = VoteAct.objects.filter(status__gt=0).order_by('begin_vote')
    votes = list(vote_published)
    #对投票活动进行排序
    for i in range(0,len(votes)-1):
        for j in range(0,len(votes)-1-i):
            if(abs(votes[j].begin_vote - now) > abs(votes[j+1].begin_vote - now)):
                temp = votes[j]
                votes[j] = votes[i]
                votes[i] = temp
    if len(votes) == 1:
        vote = votes[0]
        return get_reply_single_news_xml(msg, get_item_dict(
            title = get_text_vote_title_with_status(vote, now),
            description=get_text_activity_description(vote, 100),
            #test
            pic_url=SITE_DOMAIN + vote.pic.url,
            url=s_reverse_vote_detail(vote.id, fromuser)
        ))
    items = []
    for vote in votes:
        items.append(get_item_dict(
            title=get_text_vote_title_with_status(vote, now),
            pic_url=SITE_DOMAIN + vote.pic.url,
            url=s_reverse_vote_detail(vote.id, fromuser)
        ))
        if len(items) >= 10:
            break
    if len(items) != 0:
        return get_reply_news_xml(msg, items)
    else:
        return get_reply_text_xml(msg, get_text_no_votes())