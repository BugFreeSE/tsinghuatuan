from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from urlhandler.models import VoteAct, Candidate, VoteLog
from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.validation import Validation
import time


class VoteActValidation(Validation):
    def is_valid(self, bundle, request=None):
        if not bundle.data:
            return {'__all__': '!'}
        errors = {}
        if request.method == 'POST':
            if bundle.data['begin_vote'] > bundle.data['end_vote']:
                errors['time'] = "Vote ends before it begins"
            if VoteAct.objects.filter(key=bundle.data['key']).exists():
                errors['key'] = "The key is used by an exist vote activity"
        if bundle.data['status'] == -1 and request.method == 'PUT' \
                and bundle.obj.begin_vote.strftime('%Y-%m-%d %H:%M:%S') < time.strftime('%Y-%m-%d %H:%M:%S',
                                                                                        time.localtime(time.time())):
            errors['delete'] = "delete failed"
        return errors


class VoteActResource(ModelResource):
    class Meta:
        queryset = VoteAct.objects.all()
        resource_name = 'VoteAct'
        authorization = Authorization()
        filtering = {
            'status': ['gte']
        }
        validation = VoteActValidation()


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


class VoteLogResource(ModelResource):
    class Meta:
        queryset = VoteLog.objects.all()
        resource_name = 'VoteLog'
