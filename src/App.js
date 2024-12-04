import React,{Component} from "react";
import "./App.css"
import FileUpload from "./FileUpload";
import * as d3 from "d3"

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      sentiment: true
    }
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  }

  componentDidMount() {
    this.renderChart()
  }

  componentDidUpdate() {
    this.renderChart()
  }

  renderChart() {
    const data = this.state.data
    var catCenters = {"March":100, "April":300, "May":500};
    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0,1]).range(["#ECECEC","#4467C4"]);
    console.log(d3.selectAll("circle").size())
    let circle = d3.select("g").selectAll("circle").data(data).join(
      enter => enter.append("circle").attr("r", 4)
      .attr("fill",d=>this.state.sentiment ? sentimentColorScale(d.Sentiment) : subjectivityColorScale(d.Subjectivity)),
      update => update.attr("fill", d => this.state.sentiment? sentimentColorScale(d.Sentiment): subjectivityColorScale(d.Subjectivity)),
      exit => exit.remove()
    )
    .on("click",(e,d) => {
      let selection = d3.select(e.target)
      let data = d
      selection.attr("stroke",d=>{
        if(selection.attr('stroke')==="black"){
          d3.select(`.tweetText${data.idx}`).remove()
          return "none"
        } else {
          d3.select('.tweets').selectAll(`.tweetText${data.idx}`).data([data])
          .join("p").attr('class',`tweetText${data.idx}`)
          .text(d=>d.RawTweet)
          return "black"
        }
      })
    })
    
    // prevent force simulation rerender when changing dropdown
    if(d3.selectAll(".renderedCircle").size()===0) {
      d3.forceSimulation(data).force("x",d3.forceCollide(6))
      .force("y",d3.forceY(d=>catCenters[d.Month]))
      .on("tick",()=> {
        // had to seperate majority of circle functionality because caused freezing for some reason
          circle.attr("cx",d=>d.x).attr("cy",d=>d.y).attr('class','renderedCircle')
      })
    }
    // labels
    d3.select(".labels").selectAll(".monthLabel").data(Object.keys(catCenters))
    .join("text").attr("class","monthLabel").attr("x",0).attr("y",d=>catCenters[d])
    .attr("transform","translate(0,35)").text(d=>d)

    // legend
    const sentimentGradient = [1,.9,.8,.7,.6,.5,.4,.3,.2,.1,0,-.1,-.2,-.3,-.4,-.5,-.6,-.7,-.8,-.9,-1]
    const subjectivityGradient = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0]
    d3.select(".legend").selectAll(".gradientSquare").data(this.state.sentiment ? sentimentGradient : subjectivityGradient)
    .join("rect").attr("class","gradientSquare").attr('x',0).attr('y',(d,i)=>10*i).attr('height',10).attr('width',20)
    .attr('transform','translate(0,100)')
    .attr('fill',d=>this.state.sentiment ? sentimentColorScale(d) : subjectivityColorScale(d))

    d3.select(".legend").selectAll(".topLabel").data([0]).join('text')
    .attr("class","topLabel").attr('x',22).attr('y',10).attr('transform','translate(0,100)')
    .text(d=>this.state.sentiment ? "Positive":"Subjective")

    d3.select(".legend").selectAll(".bottomLabel").data([0]).join('text')
    .attr("class","bottomLabel").attr('x',22).attr('y',210).attr('transform','translate(0,100)')
    .text(d=>this.state.sentiment ? "Negative":"Objective")
  }

  handleChange = (e) => {
    if(e.target.value === "subjectivity") {
      this.setState({sentiment:false})
    } else {
      this.setState({sentiment:true})
    }
  }

  render() {
    return (
      <>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div>
          <label for="colorBy">Color By: </label>
          <select onChange={this.handleChange} id="colorBy" name="colorBy">
            <option value="sentiment">Sentiment</option>
            <option value="subjectivity">Subjectivity</option>
          </select>
        </div>
        <div className="container">
          <svg width="100" height="600" className="labels">
          </svg>
          <svg width="1100" height="600"><g transform="translate(500,35)"></g></svg>
          <svg width="100" height="600" className="legend"></svg>
        </div>
        <div width="1100" className="tweets"></div>
      </>
    )
  }
}