from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from urlhandler.models import VoteAct, Candidate, VoteLog
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.validation import Validation
from tastypie.authentication import BasicAuthentication, Authentication, MultiAuthentication, SessionAuthentication
import time


class MyAuthentication(Authentication):
    def is_authenticated(self, request, **kwargs):
        if request.method == "GET":
            return True
        else:
            return False


class VoteActValidation(Validation):
    def is_valid(self, bundle, request=None):
        if not bundle.data:
            return {'__all__': '!'}
        errors = {}
        if request.method == 'POST':
            if bundle.data['begin_vote'] > bundle.data['end_vote']:
                errors['time'] = "Vote ends before it begins"
            if VoteAct.objects.filter(key=bundle.data['key'],status__lt=2,status__gt=-1).exists():
                errors['key'] = "The key is used by an exist vote activity"
        if not bundle.obj.begin_vote is None:
            if bundle.data['status'] == -1 and request.method == 'PATCH' \
                    and bundle.obj.begin_vote.strftime('%Y-%m-%d %H:%M:%S') < \
                    time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))\
                    and bundle.obj.status > 0:
                errors['delete'] = "delete failed"
                return errors
            if request.method == 'PATCH' and bundle.obj.begin_vote.strftime('%Y-%m-%d %H:%M:%S') < \
                    time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())) and \
                    (not eval(request._body).has_key('bonus_result')):
                errors['update'] = "update failed"
        return errors


class VoteActResource(ModelResource):
    class Meta:
        queryset = VoteAct.objects.all()
        resource_name = 'VoteAct'
        authorization = Authorization()
        filtering = {
            'status': ['gte', 'lt'],
            'key': ['exact'],
        }
        validation = VoteActValidation()
        authentication = MultiAuthentication(MyAuthentication(), BasicAuthentication())


class CandidateResource(ModelResource):
    activity_id = fields.ForeignKey(VoteActResource, 'activity_id')

    class Meta:
        queryset = Candidate.objects.all()
        resource_name = 'Candidate'
        authorization = Authorization();
        filtering = {
            'activity_id': ALL_WITH_RELATIONS,
            'status': ['gt'],
        }
        authentication = MultiAuthentication(MyAuthentication(), BasicAuthentication())


class VoteLogResource(ModelResource):
    activity_id = fields.ForeignKey(VoteActResource, 'activity_id')

    class Meta:
        queryset = VoteLog.objects.all()
        resource_name = 'VoteLog'
        filtering = {
            'activity_id': ALL_WITH_RELATIONS,
        }
        authentication = MultiAuthentication(MyAuthentication(), BasicAuthentication())
