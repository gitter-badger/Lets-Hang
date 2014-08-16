from django.db import models

from djangotoolbox.fields import ListField
# Create your models here.
class Activities(models.Models):
	act_name = models.CharField()
	act_location = ListField()
	act_invited = ListField()
	start_date = models.DateField()
	end_date = models.DateField()
	start_time = models.TimeField()
	end_time = models.TimeField()
	creator = models.CharField()


class Calendar(models.Models):
	cal_acts_row = ListField()
	cal_acts_col = ListField()
