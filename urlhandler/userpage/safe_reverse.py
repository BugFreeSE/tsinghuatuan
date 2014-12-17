from django.core.urlresolvers import reverse
from queryhandler.settings import SITE_DOMAIN


def s_reverse_validate(openid):
    return SITE_DOMAIN + reverse('userpage.views.validate_view', kwargs={'openid': openid})


def s_reverse_activity_detail(activityid):
    return SITE_DOMAIN + reverse('userpage.views.details_view', kwargs={'activityid': activityid})


def s_reverse_ticket_detail(uid):
    return SITE_DOMAIN + reverse('userpage.views.ticket_view', kwargs={'uid': uid})


def s_reverse_help():
    return SITE_DOMAIN + reverse('userpage.views.help_view')


def s_reverse_activity_menu(actid):
    return SITE_DOMAIN + reverse('userpage.views.activity_menu_view', kwargs={'actid': actid})


def s_reverse_setting(openid):
    return SITE_DOMAIN + reverse('userpage.views.setting_view',kwargs={'openid': openid})

def s_reverse_vote_detail(vote_act_id, stu_id):
    return SITE_DOMAIN + reverse('userpage.views.vote_details_view', kwargs={'voteActId': vote_act_id, 'stu_id': stu_id})
