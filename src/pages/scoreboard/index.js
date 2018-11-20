'use strict';

var scoreboardconfig = require("utils/scoreboard.js");
var scoreboard = {
    interval : 0,
    instruction_status : [],
    functional_unit_status : {"integer":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":1}],"multi":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":10}],"add":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":2}],"divide":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":40}]},
    register_result_status : {"f0":[],"f1":[],"f2":[],"f3":[],"f4":[],"f5":[],"f6":[],"f7":[],"f8":[],"f9":[],"f10":[]},
    instruction : [],
    scoreboardInit : function(){//页面加载时就需要启动
        for(let i=0;i<this.instruction.length;i++)
        {
            this.instruction_status.add(scoreboardconfig.insStage);
        }
    },
    addUnit : function(unit_type){//点击要添加的元件，就会添加
        this.functional_unit_status[unit_type].add({"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":unit_time[unit_type]});
    },
    start_simul : function(){//开始模拟，启动时钟，向画板添加部件
        window.setInterval(this.intervalCheck,1000);
    },
    intervalCheck : function(){
        let used = [];
        this.interval++;
        used.push(this.issueOP(this.interval));
        used.push(this.readOp(this.interval,used));
        used.push(this.execute(this.interval,used));
        this.writebackOp(this.interval,used);
    },
    issueOP : function(interval){
        for(let j=0,len=instruction.length;j<len;j++)
        {
            if(instruction_status[j]["issue"] == 0){
                let insOp = instruction[j]["op"];
                for (let i=0,len1=this.functional_unit_status[insOp].length;i<len1;i++)
                {
                    if(this.functional_unit_status[insOp][i]["busy"]===false)
                    {
                        let unit = {"name":j,"busy":true,"op":insOp,"fi":instruction[j]["fi"],"fj":instruction[j]["fj"],"fk":instruction[j]["fk"],"qj":"","qk":"","rj":"yes","rk":"yes","time":unit_time[insOp]};
                        for(let k=0,len2=this.functional_unit_status["integer"].length;k<len2;k++){
                            let op = this.functional_unit_status["integer"][k];
                            if(op["fi"] === unit["fj"]){
                                unit["qj"] = op["op"];
                                unit["rj"] = "no";
                            }
                            if(op["fi"] === unit["fk"]){
                                unit["qk"] = op["op"];
                                unit["rk"] = "no";
                            }
                        }
                        for(let k=0,len2=this.functional_unit_status["multi"].length;k<len2;k++){
                            let op = this.functional_unit_status["multi"][k];
                            if(op["fi"] === unit["fj"]){
                                unit["qj"] = op["op"];
                                unit["rj"] = "no";
                            }
                            if(op["fi"] === unit["fk"]){
                                unit["qk"] = op["op"];
                                unit["rk"] = "no";
                            }
                        }
                        for(let k=0,len2=this.functional_unit_status["add"].length;k<len2;k++){
                            let op = this.functional_unit_status["add"][k];
                            if(op["fi"] === unit["fj"]){
                                unit["qj"] = op["op"];
                                unit["rj"] = "no";
                            }
                            if(op["fi"] === unit["fk"]){
                                unit["qk"] = op["op"];
                                unit["rk"] = "no";
                            }
                        }
                        for(let k=0,len2=this.functional_unit_status["divide"].length;k<len2;k++){
                            let op = this.functional_unit_status["divide"][k];
                            if(op["fi"] === unit["fj"]){
                                unit["qj"] = op["op"];
                                unit["rj"] = "no";
                            }
                            if(op["fi"] === unit["fk"]){
                                unit["qk"] = op["op"];
                                unit["rk"] = "no";
                            }
                        }
                        this.functional_unit_status[insOp][i] = unit;
                        this.register_result_status[unit["fi"]].push(unit["op"]);
                        this.instruction_status[j]["issue"]=interval;
                        return j;
                    }
                }
            }
        }
    },
    readOp : function(interval,used){
        for(let j=0,len=instruction.length;j<len;j++)
        {
            if(instruction_status[j]["issue"] != 1&&instruction_status[j]["read_op"] == 0&&!(j in used))
            {
                let insOp = instruction[j]["op"];
                for (let i=0,len1=this.functional_unit_status[insOp].length;i<len1;i++){
                    if(this.functional_unit_status[insOp][i]["name"] === j){
                        if(this.functional_unit_status[insOp][i]["rj"]==="yes"&this.functional_unit_status[insOp][i]["rk"]==="yes"){
                            this.instruction_status[j]["issue"]=interval;
                            return j;
                        }
                    }
                }
            }
        }


    },
    execute : function(interval,used){
        for(let j=0,len=instruction.length;j<len;j++)
        {
            if(instruction_status[j]["read_op"] != 1&&instruction_status[j]["exe_op"] == 0&&!(j in used))
            {
                let insOp = instruction[j]["op"];
                for (let i=0,len1=this.functional_unit_status[insOp].length;i<len1;i++){
                    if(this.functional_unit_status[insOp][i]["name"] === j){
                        if(this.functional_unit_status[insOp][i]["time"] === 1){
                            this.instruction_status[j]["issue"]=interval;
                        }
                        else{
                            this.functional_unit_status[insOp][i]["time"] = this.functional_unit_status[insOp][i]["time"]-1;
                        }
                        return j;
                    }
                }

            }
        }

    },
    writebackOp : function(interval,used){
        for(let j=0,len=instruction.length;j<len;j++)
        {
            if(instruction_status[j]["exe_op"] != 1&&instruction_status[j]["write"] == 0&&!(j in used))
            {
                let go = true;
                let insOp = instruction[j]["op"];
                for(let i=0;i<j;i++){
                    if((instruction[i]["fj"]===instruction[j]["fi"]||instruction[i]["fk"]===instruction[j]["fi"])&&instruction_status[i]["read_op"]===0){
                        go =false;
                    }
                }
                if(go == true){
                    let fi = instruction[j]["fi"];
                    for (let i=0,len1=this.functional_unit_status[insOp].length;i<len1;i++){//复位
                        if(functional_unit_status[insOp][i]["name"] == j){
                            functional_unit_status[insOp][i] = {"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":unit_time[insOp]}
                        }
                    }
                    for(let k=j+1,len2=this.instruction.length;k<len2,instruction[k]["fi"]!=fi;k++){//遍历后面的指令，直到最后一条指令或遇到写入存储单元相同的指令
                        if(fi === instruction[k]["fj"]){
                            let type = this.functional_unit_status[instruction[k]["op"]];
                            for(let l=0,len3=this.functional_unit_status[type].length;l<len3;l++){
                                if(this.functional_unit_status[type][l]["name"] === k){
                                    this.functional_unit_status[type][l]["rj"] = "yes";
                                }
                            }
                        }
                        if(fi === instruction[k]["fk"]){
                            let type = this.functional_unit_status[instruction[k]["op"]];
                            for(let l=0,len3=this.functional_unit_status[type].length;l<len3;l++){
                                if(this.functional_unit_status[type][l]["name"] === k){
                                    this.functional_unit_status[type][l]["rk"] = "yes";
                                }
                            }
                        }
                    }
                    let k = this.register_result_status[fi].indexOf(insOp);
                    this.register_result_status[fi].splice(k,1);
                    this.instruction_status[j]["write"]=interval;
                    return j;
                }
                
            }
        }
    }
}
var operation = {
    addInstruction : function(phrase){
        let params = {"op":"","fi":"","fj":"","fk":""};
        let result = phrase.trim().split(/\s+/);
        params["op"] = result[0];
        params["fi"] = result[1];
        params["fj"] = result[2];
        params["fk"] = result[3];
        scoreboard.instruction.push(params);
    },
    deleteInstruction :function(id){
        scoreboard.instruction.splice(id,1);
    },
    clearStatus : function(){
        scoreboard.interval = 0;
        scoreboard.instruction_status = [];
        scoreboard.functional_unit_status = {"integer":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":1}],"multi":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":10}],"add":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":2}],"divide":[{"name":"","busy":false,"op":"","fi":"","fj":"","fk":"","qj":"","qk":"","rj":"","rk":"","time":40}]};
        scoreboard.register_result_status = {"f0":[],"f1":[],"f2":[],"f3":[],"f4":[],"f5":[],"f6":[],"f7":[],"f8":[],"f9":[],"f10":[]};
    }
}
var display = {
    
}