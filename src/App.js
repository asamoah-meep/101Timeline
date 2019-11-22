import React from 'react';
import './App.css';
import fallData from "./Data/Fall2018.json";
import springData from "./Data/Spring2018.json";
import Timeline from "./Timeline";
import UseCaseRow from "./UseCase";
import moment from "moment";
import * as d3Selection from "d3-selection";
import * as d3Scale from "d3-scale";
import {Helmet} from 'react-helmet';

class App extends React.Component{

  constructor(props){
    super(props);

    const scale = d3Scale.scaleTime()
      .domain([moment("2018-09-01"),moment("2019-05-20")])
      .range([0,1150]);

    this.updateZoom = this.updateZoom.bind(this);
    this.updateStart=this.updateStart.bind(this);
    this.updateEnd = this.updateEnd.bind(this);
    this.updateFrame = this.updateFrame.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.filterStudent = this.filterStudent.bind(this);
    this.filterTutor = this.filterTutor.bind(this);
    this.enterStudent = this.enterStudent.bind(this);
    this.enterTutor = this.enterTutor.bind(this);
    this.parseData = this.parseData.bind(this);
    this.mergeData = this.mergeData.bind(this);
 
    const fData = this.parseData(fallData);
    const sData = this.parseData(springData);

    const allData = this.mergeData(fData,sData);

    this.state={
      start:moment("2018-09-01"),
      end: moment("2019-05-20"),   
      scale:scale,
      filteredData:allData,
      initData:allData,
      queryStudent:"",
      queryTutor:""
    }
  }


  parseData(semesterData){
    const profData = [];
    for(let student of semesterData){
      if(profData[student.professor] === undefined)
        profData[student.professor] = [];

      profData[student.professor].push(student); 
    }

    return profData;
  }

  mergeData(fData,sData){
    const allData = {};

    for(let f in fData)
      allData[f] = fData[f];
    
    for(let s in sData){
      if(s in allData)
        allData[s] = allData[s].concat(sData[s]);
      else
        allData[s] = sData[s];
    }

    return allData;
  }

  updateStart(date,f){
    this.setState({
      start:moment(date)
    },f);
  }
  
  updateEnd(date,f){
    this.setState({
      end:moment(date)
    },f);
  }

  updateFrame(frame,f){
    let start = this.state.start;
    let end = this.state.end;

    switch(frame){
      case "1 day":
        end = moment(start).add(1,"day").isBefore(moment()) ? moment(start).add(1,"day") : end;
        this.setState({
          end: end
        }, f);
        break;

      case "1 week":     
        end = moment(start).add(1,"week").isBefore(moment()) ? moment(start).add(1,"week") : end;
        this.setState({
          end:end
        },f);
        break;

      case "1 month":
        end = moment(start).add(1,"month").isBefore(moment()) ? moment(start).add(1,"month") : end;
        this.setState({
          end:end
        },f);
        break;

      case "Fall Semester":
        start = moment('2018-09-01');
        end = moment('2018-12-15');
        this.setState({
          start:start,
          end:end
        },f);
        break;

      case "Spring Semester":
        start = moment('2019-01-25');
        end = moment('2019-05-20');
        this.setState({
          start:start,
          end:end
        },f);
        break;

      case "All":
      default:
        this.setState({
          start:moment("2018-09-01"),
          end: moment("2019-05-20")
        },f);
        break;

    }
  }

  updateZoom(scale,f){
    let s = null, e = null;

    if(d3Selection.event.selection === null){
      this.resetZoom(scale,f);
      return;
    }

    [s,e] = d3Selection.event.selection.map(ele=>scale.invert(ele));
    s = moment(s);
    e = moment(e);
    

    this.setState({
      start:s,
      end:e
    });
  }

  resetZoom(scale,f){
    if(d3Selection.event.selection === null){
      this.setState({
          start:moment("2018-09-01"),
          end: moment('2019-05-20')
      },f);
    }
  }


  enterStudent(event){
    this.setState({queryStudent:event.target.value});
  }

  enterTutor(event){
    this.setState({queryTutor:event.target.value});
  }

  filterStudent(event){
    event.preventDefault();

    const query = this.state.queryStudent;
    if(query==="" || query===null || query===undefined)
      return this.state.initData;
      
    const filteredData = {};
    for(let prof in this.state.filteredData){
      filteredData[prof] = [];
    }
    

    for(let prof in this.state.initData){
      for(let student of this.state.initData[prof]){
        if(student.name.toLowerCase().includes(query.toLowerCase()))
          filteredData[prof].push(student);
      }
    }

    this.setState({
      filteredData:filteredData,
      queryTutor:""
    });
  }

  resetFilter(event){
    event.preventDefault();
    d3Selection.select("#info").classed('hideInfo',true);
    //d3Selection.select("#info").selectAll("*").remove();
    this.setState({
      filteredData:this.state.initData,
      queryStudent:"",
      queryTutor:""});
  }

  filterTutor(event){
    event.preventDefault();

    const query = this.state.queryTutor;
    if(query==="" || query===null || query===undefined)
      return this.state.initData;
      
    const filteredData = {};
    for(let prof in this.state.filteredData){
      filteredData[prof] = [];
    }
    
    for(let prof in this.state.initData){
      for(let student of this.state.initData[prof]){
        if(student.tutor.toLowerCase().includes(query.toLowerCase()))
          filteredData[prof].push(student);
      }
    }

    this.setState({
      filteredData:filteredData,
      queryStudent:""
    });
  }

  render(){
    const profData = [];

    let numProfs = 0;
    for(let ele in this.state.filteredData){
      const prof = this.state.filteredData[ele];
      const uc = <UseCaseRow num={numProfs++} data ={prof} name={ele.split(" ")[0]} lastName ={ele.split(" ")[1]} key={ele}
      start = {this.state.start} end = {this.state.end} width = {900}/>
      profData.push(uc);
    }

    const ucContainer = <div id="ucContainer">
      {profData}
    </div>

    const timeLine = <Timeline width={900}start={this.state.start} end = {this.state.end} 
    updateZoom = {this.updateZoom}updateEnd = {this.updateEnd} updateStart={this.updateStart} 
    setFrame={this.updateFrame} data={this.state.filteredData} key='Timeline'/>;

    let info = <div id="info" className='hideInfo'></div>    
 
    const legend = <div id='legend'>
        <h3>LEGEND</h3>
        <p>Jeff: <i className='fas fa-dragon'></i>  Julia: <i className='fas fa-cat'></i> Bella: <i className='fas fa-lemon'></i></p>
        <p>Alex: <i className='fas fa-dog'></i> Alan: <i className='fas fa-crow'></i>  Hari: <i className='fas fa-cheese'></i></p>
        <p>Ilias: <i className='fas fa-hippo'></i>  Aashish: <i className='fas fa-horse'></i> Gilad: <i className='fas fa-frog'></i></p>
        <p>Cindy: <i className='fas fa-spider'></i>Santiago: <i className='fas fa-bread-slice'></i>  Rahul: <i className='fas fa-fish'></i></p>
        <p>Jonathan: <i className='fas fa-apple-alt'></i></p>
        <br/>
        <p><span style={{color:'#CF142B'}}>Red</span>: Unresolved</p>
        <p><span style={{color:"#FAD201"}}>Yellow</span>: Partially Resolved</p>
        <p><span style={{color:"#33A532"}}>Green</span>: Resolved</p>
      </div>

    const filter = <div id='filter'> <form onSubmit={this.filterStudent}>
          Enter the Student Name: <input type="text" value={this.state.queryStudent} onChange={this.enterStudent}/>
          <input type='submit'/> </form>
        <form onSubmit={this.filterTutor} onReset = {this.resetFilter}>
          Enter the Tutor Name:  <input type="text" value={this.state.queryTutor} onChange={this.enterTutor}/>
          <input type='submit'/> <br/>
          <input type='reset'/>
        </form>
      </div>

    return <div>
      <Helmet>
        <title>Tutor Timeline</title>
      </Helmet>
      <h1>2018-2019 CS101 Tutoring Timeline</h1>
      {filter}
      {ucContainer}
      {timeLine}
      {legend}
      {info}
    </div>
  }
  
}
export default App;
