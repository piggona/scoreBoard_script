'use strict';

require('./index.css');
var _instruction = require('html-loader!./instruction.html');
var _status = require('html-loader!./status.html');
var _register = require('html-loader!./register.html');
var _unit = require('html-loader!./unit.html');

var _utils = require('utils/scoreboard.js');


var scoreboard = {
    all_instruction : [],
    scoreboardConfig : {"instruction" : {"op": "","Fi":"","Fj":"","Fk":""},"insStage" : {"issue":0,"read_op":0,"exe_op":0,"write":0},"functional_status" : {"busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":""},"unit_count" : {"integer":1,"multi":1,"add":1,"divide":1},"memory_block" : 30},
    unit_time : {
        "integer" : 1,
        "multi" : 10,
        "add" : 2,
        "divide" : 40
    },
    interval: -1,
    instruction_status: [],
    functional_unit_status: { "integer": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 1 }], "multi": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 10 }], "add": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 2 }], "divide": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 40 }] },
    register_result_status: { "f0": [], "f1": [], "f2": [], "f3": [], "f4": [], "f5": [], "f6": [], "f7": [], "f8": [], "f9": [], "f10": [] },
    instruction: [],
    scoreboardInit: function () {//页面加载时就需要启动
        for (let i = 0; i < this.all_instruction.length; i++) {
            let insStage = {};
            Object.assign(insStage,this.scoreboardConfig["insStage"]);
            this.instruction_status.push(insStage);
        }
        this.displayStatus();
        this.displayUnit();
        this.displayRegister();
    },
    addUnit: function (unit_type) {//点击要添加的元件，就会添加
        this.functional_unit_status[unit_type].add({ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": this.unit_time[unit_type] });
    },
    start_simul: function () {//开始模拟，启动时钟，向画板添加部件
        window.setInterval(this.intervalCheck, 1000);
    },
    intervalCheck: function () {
        let used = [];
        this.interval++;
        if(this.all_instruction.length!=0){
            this.instruction.push(this.all_instruction[0]);
            this.all_instruction.splice(0,1);
            used.push(this.instruction.length-1);
        }
        let issueCheck = this.issueOP(this.interval,used);
        used.push(issueCheck);
        let readCheck = this.readOp(this.interval, used);
        used.push(readCheck);
        let execute = this.execute(this.interval, used);
        if(typeof(execute)!="undefined"){
            for(let i=0,len=execute.length;i<len;i++){
                used.push(execute[i])
            }
        }
        this.writebackOp(this.interval, used);
        this.displayStatus();
        this.displayUnit();
        this.displayRegister();
    },
    issueOP: function (issue_interval,used) {
        for (let j = 0, len = this.instruction.length; j < len; j++)//遍历instruction list
        {
            if (this.instruction_status[j]["issue"] == 0 && used.indexOf(j)==-1) {//issue为0
                let insOp = this.instruction[j]["op"];
                for (let i = 0, len1 = this.functional_unit_status[insOp].length; i < len1; i++) {
                    if (this.functional_unit_status[insOp][i]["busy"] === false) {//器件状态不是busy
                        let unit = { "name": j, "busy": true, "op": insOp, "fi": this.instruction[j]["fi"], "fj": this.instruction[j]["fj"], "fk": this.instruction[j]["fk"], "qj": "", "qk": "", "rj": "yes", "rk": "yes", "time": this.unit_time[insOp] };
                        //判断有没有RAW冲突
                        for(let k=0;k<j;k++){
                            if(this.instruction_status[k]["write"]==0){
                                if(this.instruction[k]["fi"]===unit["fj"]){
                                    unit["qj"] = this.instruction[k]["op"];
                                    unit["rj"] = "no";
                                }
                                if(this.instruction[k]["fi"]===unit["fk"]){
                                    unit["qk"] = this.instruction[k]["op"];
                                    unit["rk"] = "no";
                                }

                            }
                        }

                        this.functional_unit_status[insOp][i] = unit;//加入unit
                        this.register_result_status[unit["fi"]].push(unit["op"]);
                        this.instruction_status[j]["issue"] = issue_interval;
                        return j;
                    }
                }
            }
        }
    },
    readOp: function (read_interval, used) {
        for (let j = 0, len = this.instruction.length; j < len; j++) {
            if (this.instruction_status[j]["issue"] != 0 && this.instruction_status[j]["read_op"] == 0 && used.indexOf(j)==-1) {
                let insOp = this.instruction[j]["op"];
                for (let i = 0, len1 = this.functional_unit_status[insOp].length; i < len1; i++) {
                    if (this.functional_unit_status[insOp][i]["name"] === j) {
                        if (this.functional_unit_status[insOp][i]["rj"] === "yes" && this.functional_unit_status[insOp][i]["rk"] === "yes") {
                            this.instruction_status[j]["read_op"] = read_interval;
                            return j;
                        }
                    }
                }
            }
        }


    },
    execute: function (exe_interval, used) {
        let exe_op = ["integer","multi","add","divide"];
        let used_ins = [];
        for (let j = 0, len = this.instruction.length; j < len; j++) {
            let insOp = this.instruction[j]["op"];
            if(exe_op.indexOf(insOp)!=-1){
                if (this.instruction_status[j]["read_op"] != 0 && this.instruction_status[j]["exe_op"] == 0 && used.indexOf(j)==-1) {
                    for (let i = 0, len1 = this.functional_unit_status[insOp].length; i < len1; i++) {
                        if (this.functional_unit_status[insOp][i]["name"] === j) {
                            if (this.functional_unit_status[insOp][i]["time"] === 1) {
                                this.instruction_status[j]["exe_op"] = exe_interval;
                            }
                            else {
                                this.functional_unit_status[insOp][i]["time"] = this.functional_unit_status[insOp][i]["time"] - 1;
                            }
                            exe_op.splice(exe_op.indexOf(insOp),1);
                            if(exe_op.length == 0)
                            {
                                used_ins.push(j);
                                return used_ins;
                            }else{
                                used_ins.push(j);
                            }
                        }
                    }
                }
            }
        }
        if(used_ins.length!=0){
            return used_ins;
        }

    },
    writebackOp: function (write_interval, used) {
        for (let j = 0, len = this.instruction.length; j < len; j++) {
            if (this.instruction_status[j]["exe_op"] != 0 && this.instruction_status[j]["write"] == 0 && used.indexOf(j)==-1) {
                let go = true;
                let insOp = this.instruction[j]["op"];
                for (let i = 0; i < j; i++) {//判断前面是否有冲突
                    if ((this.instruction[i]["fj"] === this.instruction[j]["fi"] || this.instruction[i]["fk"] === this.instruction[j]["fi"]) && this.instruction_status[i]["read_op"] === 0) {
                        go = false;
                    }
                }
                if (go == true) {
                    let fi = this.instruction[j]["fi"];
                    for (let i = 0, len1 = this.functional_unit_status[insOp].length; i < len1; i++) {//复位
                        if (this.functional_unit_status[insOp][i]["name"] == j) {
                            this.functional_unit_status[insOp][i] = { "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": this.unit_time[insOp] }
                        }
                    }
                    for (let k = j + 1, len2 = this.instruction.length; k < len2; k++) {//遍历后面的指令，直到最后一条指令或遇到写入存储单元相同的指令
                        if(this.instruction[k]["fi"] != fi){
                            if (fi === this.instruction[k]["fj"]) {
                                let type = this.functional_unit_status[this.instruction[k]["op"]];
                                for (let l = 0, len3 = type.length; l < len3; l++) {
                                    if (this.functional_unit_status[this.instruction[k]["op"]][l]["name"] === k) {
                                        this.functional_unit_status[this.instruction[k]["op"]][l]["rj"] = "yes";
                                        this.functional_unit_status[this.instruction[k]["op"]][l]["qj"] = "";
                                    }
                                }
                            }
                            if (fi === this.instruction[k]["fk"]) {
                                let type = this.functional_unit_status[this.instruction[k]["op"]];
                                for (let l = 0, len3 = type.length; l < len3; l++) {
                                    if (this.functional_unit_status[this.instruction[k]["op"]][l]["name"] === k) {
                                        this.functional_unit_status[this.instruction[k]["op"]][l]["rk"] = "yes";
                                        this.functional_unit_status[this.instruction[k]["op"]][l]["qk"] = "";
                                    }
                                }
                            }
                        }
                    }
                    let k_index = this.register_result_status[fi].indexOf(insOp);
                    this.register_result_status[fi].splice(k_index, 1);
                    this.instruction_status[j]["write"] = write_interval;
                    return j;
                }

            }
        }
    },
    displayIns: function () {
        $('#instruction').html("");
        let res = this.all_instruction;
        for (let i = 0, len = res.length; i < len; i++) {
            res[i]["id"] = i;
            $('#instruction').append(_utils.renderHtml(_instruction, res[i]));
        }
    },
    displayStatus: function () {
        $('#status').html("");
        let status = this.instruction_status;
        for (let j = 0, len1 = status.length; j < len1; j++) {
            $('#status').append(_utils.renderHtml(_status, status[j]));
        }
    },
    displayUnit: function () {
        $('#unit').html("");
        let unit = this.functional_unit_status;
        for (let k = 0, len2 = unit["integer"].length; k < len2; k++) {
            $('#unit').append(_utils.renderHtml(_unit, unit["integer"][k]))
        }
        for (let k = 0, len2 = unit["multi"].length; k < len2; k++) {
            $('#unit').append(_utils.renderHtml(_unit, unit["multi"][k]))
        }
        for (let k = 0, len2 = unit["add"].length; k < len2; k++) {
            $('#unit').append(_utils.renderHtml(_unit, unit["add"][k]))
        }
        for (let k = 0, len2 = unit["divide"].length; k < len2; k++) {
            $('#unit').append(_utils.renderHtml(_unit, unit["divide"][k]))
        }
    },
    displayRegister: function () {
        $('#register').html("");
        $('#register').append(_utils.renderHtml(_register, this.register_result_status));
    },
    init: function () {
        console.log("init");
        this.bindEvent();
    },
    bindEvent: function () {
        // 两个回调函数
        let _op = this;
        $('#confirm').click(function () {
            _op.confirm();
        })
        $('#add-btn').click(function () {
            _op.addInstruction($('#instruction-input').val());
            _op.displayIns();
            $('#delete-button').click(function () {
                console.log($(this).attr("value"));
                _op.deleteInstruction($(this).attr("value"));
                _op.displayIns();
            });
        });
        $('#start').click(function () {
            _op.start_simul();
        });
        $('#one-step').click(function () {
            _op.intervalCheck();
        });
        $('#clear').click(function () {
            _op.clearStatus();
            _op.displayStatus();
            _op.displayUnit();
            _op.displayRegister();
        });
        $('#add-integer').click(function(){
            _op.functional_unit_status["integer"].push({ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 1 });
        });
        $('#add-add').click(function(){
            _op.functional_unit_status["integer"].push({ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 2 });
        });
        $('#add-multi').click(function(){
            _op.functional_unit_status["integer"].push({ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 10 });
        })
        $('#add-divide').click(function(){
            _op.functional_unit_status["integer"].push({ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 40 });
        })
    },
    addInstruction: function (phrase) {
        let params = { "op": "", "fi": "", "fj": "", "fk": "" };
        let result = phrase.trim().split(/\s+/);
        if (result[0] === "LD") {
            params["op"] = "integer";
        } else if (result[0] === "MULTI") {
            params["op"] = "multi";
        } else if (result[0] === "SUBD" || result[0] === "ADDD") {
            params["op"] = "add";
        } else if (result[0] === "DIVD") {
            params["op"] = "divide"
        }
        params["fi"] = result[1];
        params["fj"] = result[2];
        params["fk"] = result[3];
        this.all_instruction.push(params);
    },
    deleteInstruction: function (id) {
        this.instruction.splice(id, 1);
    },
    clearStatus: function () {
        this.interval = -1;
        this.all_instruction = this.instruction;
        this.instruction = [];
        this.instruction_status = [];
        this.functional_unit_status = { "integer": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 1 }], "multi": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 10 }], "add": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 2 }], "divide": [{ "name": "", "busy": false, "op": "", "fi": "", "fj": "", "fk": "", "qj": "", "qk": "", "rj": "", "rk": "", "time": 40 }] };
        this.register_result_status = { "f0": [], "f1": [], "f2": [], "f3": [], "f4": [], "f5": [], "f6": [], "f7": [], "f8": [], "f9": [], "f10": [] };
    },
    confirm: function () {
        this.scoreboardInit();
    }
}

scoreboard.init();
