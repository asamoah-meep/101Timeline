import React from 'react';
import './App.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as d3Axis from 'd3-axis';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Brush from 'd3-brush';
import * as d3TimeFormat from 'd3-time-format';
import moment from "moment";

class Timeline extends React.Component{

    constructor(props){
        super(props);
        this.format = "YYYY-MM-DD";

        this.createScale = this.createScale.bind(this);
        this.updateEnd = this.updateEnd.bind(this);
        this.updateStart = this.updateStart.bind(this);
        this.removeScaleAndZoom = this.removeScaleAndZoom.bind(this);
        this.updatePoints = this.updatePoints.bind(this);
        this.createZoom = this.createZoom.bind(this);

        this.scale=d3Scale.scaleTime()
                .domain([moment("2018-09-01"),moment('2019-05-20')])
                .range([0,this.props.width+150]);

        this.f = function(){
            d3Selection.select("#zoomBox")
                .call(this.brush.move, [this.props.start,this.props.end].map(ele=>this.scale(ele)));        
        }
        this.brush = d3Brush.brushX()
                .extent([[0,0],[this.props.width+150,120]])
                .on("end",()=>this.props.updateZoom(this.scale,this.f.bind(this)));
    }

    componentDidMount(){
        this.createScale();
        this.createZoom();

        const that = this;
        d3Selection.selectAll("#timeFrame span")
            .on("click",function(){
                that.props.setFrame(this.innerHTML,that.f.bind(that));
            });
    }

    componentDidUpdate(){
        this.removeScaleAndZoom();
        this.createScale();
        this.updatePoints();
    }

    removeScaleAndZoom(){
        d3Selection.select("#timeScale")
            .remove();
        d3Selection.selectAll(".pointRow")
            .remove();
        d3Selection.select("#zoomBrush")
            .selectAll("*").remove();
    }

    updateStart(date){
        this.props.updateStart(date,this.f.bind(this));
    }

    updateEnd(date){
        this.props.updateEnd(date,this.f.bind(this));
    }

    createScale(){
        const scale = d3Scale.scaleTime()
            .domain([this.props.start,this.props.end])
            .range([0,this.props.width]);

        const axis = d3Axis.axisBottom(scale);

        let diff = Math.abs(this.props.start.diff(this.props.end,"months"));

        if(diff <= 3){
            diff = Math.abs(this.props.start.diff(this.props.end,"hours"));
            if(diff < 72)
                axis.tickFormat(d3TimeFormat.timeFormat("%I%p %b %f"));
            else
                axis.tickFormat(d3TimeFormat.timeFormat("%b %e"));
        }
        else
            axis.tickFormat(d3TimeFormat.timeFormat("%b %Y"));


        d3Selection.select("#timeBox")
            .append("g")
            .attr("transform","translate(150,0)")
            .attr("id","timeScale")
            .call(axis);
    }

    createZoom(){
        const scale=this.scale;
        const axis = d3Axis.axisTop(scale);
        axis.tickFormat(d3TimeFormat.timeFormat("%b %Y"));
        const brush = this.brush;

        d3Selection.select("#timeBox")
            .append("g")
            .attr("id","zoomBox")
            .attr("transform","translate(20,30)");

        d3Selection.select("#timeBox")
            .append("g")
            .attr("transform","translate(25,140)")
            .call(axis);
        const zoomBrush = d3Selection.select("#zoomBox");

        zoomBrush
            .call(brush)
            .call(brush.move, [this.props.start,this.props.end].map(ele=>scale(ele)));        
    }

    updatePoints(){
        const profData = [];

        for(let prof in this.props.data)
            profData.push(this.props.data[prof]);

        const scale = this.scale;
        const yScale = d3Scale.scaleLinear()
        .domain([0,profData.length])
        .range([0,100]);

        d3Selection.select("#zoomBox")
            .selectAll("g [class=pointRow]")
            .data(profData)
            .enter()
            .append('g')
            .classed("pointRow",true)
            .attr('y',(d,i) => yScale(i));

        d3Selection.selectAll('.pointRow')
            .selectAll('circle [class=scalePoint]')
            .data(d => d.filter(ele=>ele.date!==null))
            .enter()
            .append('circle')
            .classed('scalePoint',true)
            .attr("cx",d=>scale(moment(d.date)))
            .attr("cy",function(d){
                return +this.parentNode.getAttribute('y') + 10;
            })
            .attr("fill",d =>{
                if(d.resolve===undefined)
                    d.resolve = 'Unresolved';
                d.resolve = d.resolve.trim();
                if(d.resolve==='Resolved: they get it!' || 
                    d.resolve==='Resolved - they get it!')
                    return '#33A532';
                else if(d.resolve==="Resolved - they're still shaky" || 
                    d.resolve==="Resolved: they're still shaky")
                    return '#FAD201';
                else if(d.resolve.includes('Unresolved'))
                    return '#CF142B';
                else   
                    return '#FAD201';
            });
    }

    render(){
        return(
            <div>
                <svg id = "timeBox" width={1100}>
                </svg>
                <br/>
                <div className="datePicker" id="startDate">Start Date:<br/><DatePicker selected={this.props.start.toDate()} onChange={date=>this.updateStart(date)} minDate={new Date('2018-09-01')}/></div>
                <div className="datePicker">End Date:<br/><DatePicker selected={this.props.end.toDate()} onChange={date=>this.updateEnd(date)} maxDate={new Date('2019-05-20')}/></div>
                <div id="timeFrame"><span>1 day</span> |  <span>1 week</span> |  <span>1 month</span> |  
                <span>Fall Semester</span> |  <span>Spring Semester</span> |  <span>All</span></div>
            </div>
        ); 
    }
}

export default Timeline;