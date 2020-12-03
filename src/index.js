import "./index.css";
import * as d3 from 'd3';
import {get_playlist} from "./common/dataapi.js"
import capitalize from 'lodash/capitalize'

get_playlist().then(promise=>{
    draw_chart(promise.averages)
}).catch(err=>console.log(err))

const width = 500;
const height = 500;
const outerRadius = width*0.45
const innerRadius = 0

const svg = d3.select("#chart")
            .append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width+100, height+100])
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round");

const layer_1 = svg.append("g")
const layer_2 = svg.append("g")
const layer_3 = svg.append("g")

const draw_chart = function(data){
    const x = d3.scaleLinear()
        .domain([0,data.length])
        .range([0, 2 * Math.PI])
    const y = d3.scaleLinear()
        .domain([0,100])
        .range([innerRadius, outerRadius])
    const line = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .angle(d => x(d["index"]))
    layer_1
        .append("path")
        .attr("fill", "linen")
        .attr("fill-opacity", .7)
        .attr("stroke", "deeppink")
        .attr("stroke-width", 1.9)
        .attr("d", line.radius(d => y(d.value))(data));
    yAxis(layer_3,data,y)
    xAxis(layer_2,data,x)
}

const xAxis = function(layer,data,x_scale){
    layer
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .call(g => g.selectAll("g")
    .data(x_scale.ticks().slice(0,8))
    .join("g")
        .each((d, i) => d)
        .call(g => g.append("path")
            .attr("stroke", "cadetblue")
            .attr("stroke-opacity", 0.2)
            .attr("d", d => `
            M${d3.pointRadial(x_scale(d), innerRadius)}
            L${d3.pointRadial(x_scale(d), outerRadius)}
            `))
        .call(g => g.append("path")
            .attr("id", d => data[d].name)
            .datum(d => [d, d])
            .attr("stroke", "none")
            .attr("fill", "none")
            .attr("d", ([a, b]) => {
                //Flipping label
                const halfDataLength = Math.floor(data.length/2)
                const flipStart = halfDataLength-1
                const flipEnd = (halfDataLength-1)*2-1
                const flipper = a >= flipStart && a <= flipEnd?-1:1
                return`
            M${d3.pointRadial(x_scale(a-(0.2*flipper)), outerRadius+15)}
            L${d3.pointRadial(x_scale(a+(0.2*flipper)), outerRadius+15)} 
            `}))
        .call(g => g
            .append("text")
            .append("textPath")
            .attr("startOffset", 6)
            .attr("xlink:href", d => "#"+data[d].name)
            .text(d=>capitalize(data[d].name))))
    }

const yAxis= function(layer,data,y){
    layer
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .call(g => g.selectAll("g")
    .data(y.ticks().filter(tick=>tick%20==0).reverse())
    .join("g")
      .attr("fill", "none")
      .call(g => g.append("circle")
          .attr("stroke", "cadetblue")
          .attr("stroke-opacity", 0.2)
          .attr("r", y))
      .call(g => g.append("text")
          .attr("y", d => -y(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 3)
          .text((x, i) => `${x.toFixed(0)}${i ? "" : "%"}`)
        .clone(true)
          .attr("y", d => y(d))
        .selectAll(function() { return [this, this.previousSibling]; })
        .clone(true)
          .attr("fill", "currentColor")
          .attr("stroke", "none")
        ))
}