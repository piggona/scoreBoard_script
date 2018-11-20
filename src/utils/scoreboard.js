'use strict';

var scoreboardConfig = {
    instruction : {"op": "","Fi":"","Fj":"","Fk":""},
    insStage : {"issue":0,"read_op":0,"exe_op":0,"write":0},
    functional_status : {"busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":""},
    unit_count : {"integer":1,"multi":1,"add":1,"divide":1},
    memory_block : 30
}
var unit_time = {
    "integer" : 1,
    "multi" : 10,
    "add" : 2,
    "divide" : 40
}
