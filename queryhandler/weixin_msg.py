#-*- coding:utf-8 -*-

from django.utils.encoding import smart_str


# convert XML List object to Python dict object
def parse_msg_xml(root_elem):
    msg = {}
    if root_elem.tag == 'xml':
        for child in root_elem:
            msg[child.tag] = smart_str(child.text)
    return msg


def get_msg_from(msg):
    return msg['FromUserName']


def get_item_dict(title='', description='', pic_url='', url=''):
    return {
        'title': title,
        'description': description,
        'pic_url': pic_url,
        'url': url,
    }