from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from urlhandler.models import VoteAct, Candidate, VoteLog
from tastypie import fields
from tastypie.authorization import Authorization


class VoteActResource(ModelResource):
    class Meta:
        queryset = VoteAct.objects.all()
        resource_name = 'VoteAct'
        authorization = Authorization();


class CandidateResource(ModelResource):
    activity_id = fields.ForeignKey(VoteActResource, 'activity_id')

    class Meta:
        queryset = Candidate.objects.all()
        resource_name = 'Candidate'
        authorization = Authorization();
        filtering = {
            'activity_id': ALL_WITH_RELATIONS,
        }


class VoteLogResource(ModelResource):
    class Meta:
        queryset = VoteLog.objects.all()
        resource_name = 'VoteLog'