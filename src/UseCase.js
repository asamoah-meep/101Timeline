import React from 'react';
import './App.css';
import "../node_modules/@fortawesome/fontawesome-free/css/all.css";
import * as d3Scale from "d3-scale";
import * as d3Selection from "d3-selection";
import moment from "moment";



class UseCaseRow extends React.Component{

    constructor(props){
        super(props);
        this.rowName=this.props.name;
        this.createItems=this.createItems.bind(this);
        this.removeItems = this.removeItems.bind(this);
        this.createInfo=this.createInfo.bind(this);

    }

    componentDidMount(){
        this.createItems();
    }

    componentDidUpdate(){
        this.removeItems();
        this.createItems();
    }

    removeItems(){
        d3Selection.select(`#${this.rowName}`).selectAll("*").remove();
        d3Selection.select(`#${this.rowName}`).append("rect")
            .classed("border",true)
            .attr("width",this.props.width+150)
            .attr("height",140);
    }
    createItems(){
        const data = this.props.data.filter(
            ele=> moment(ele.date).isBetween(this.props.start,this.props.end));
        const scale = d3Scale.scaleTime()
            .domain([this.props.start,this.props.end])
            .range([135,this.props.width+135]);

        d3Selection.select(`#${this.rowName}`)
            .selectAll("rect[class = rowImg]")
            .data(data)
            .enter()
            .append('text')
            .classed("fas",true)
            .text(d=>{
                if(d.tutor.includes("Jeff"))
                    return '\uf6d5'; //dragon
                else if(d.tutor.includes("Julia"))
                    return '\uf6be'; //cat
                else if(d.tutor.includes("Bella") || d.tutor.includes("Isabella"))
                    return '\uf094'; // lemon
                else if(d.tutor.includes("Alex"))
                    return '\uf6d3'; // dog
                else if(d.tutor.includes("Alan"))
                    return '\uf4ba'; //bird
                else if(d.tutor.includes("Hari"))
                    return '\uf7ef'; //cheese
                else if(d.tutor.includes("Ilias"))
                    return '\uf6ed'; //hippo
                else if(d.tutor.includes("Aashish"))
                    return '\uf6f0'; //horse
                else if(d.tutor.includes("Gilad"))
                    return '\uf700'; //frog
                else if(d.tutor.includes("Cindy"))
                    return '\uf717'; //spider
                else if(d.tutor.includes("Jonathan"))
                    return '\uf5d1'; //apple
                else if(d.tutor.includes("Santiago"))
                    return '\uf7ec'; //toast
                else if(d.tutor.includes("Rahul"))
                    return '\uf578'; //fish
                else
                    return '\uf563'; //cookie
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
            })
            .attr("x",d=> scale(moment(d.date)))
            .attr('y',(d,i)=>(15+(30*i%150)))
            .on("click",(d)=>this.createInfo(d))
            .append('title')
            .attr('text',d=>d.tutor);

        d3Selection.select(`#${this.rowName}`)
            .classed("ucRow",true)
            .append("text")
            .attr("x",5)
            .attr("y",75)
            .classed("ucName",true)
            .text(this.props.lastName)
            .append("title")
            .text(this.rowName + " " + this.props.lastName);        
    }

    createInfo(d){
        const info = d3Selection.select("#info");
        info.classed('hideInfo',false);
        info.selectAll("*").remove();

        for(let attr in d){
            if(attr === 'date')
                info.append('p').text("Date: " + moment(d[attr])
                .format("dddd, MMMM Do YYYY, h:mm:ss a"));
            else if(attr === 'resolve')
                info.append('p').text(d[attr]);
            else{
                const attrTitle = attr[0].toUpperCase() + attr.substring(1);
                info.append("p").text(attrTitle+":"+d[attr]);
            }
        }
    }

    render(){
        return (
            <svg id={this.rowName} className="row" width={this.props.width+150} height={140}>
                <rect className="border" width={this.props.width+150} height={140}/>
            </svg>
        )
    }
}

export default UseCaseRow;