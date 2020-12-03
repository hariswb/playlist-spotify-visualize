const ENDPOINT = "https://gist.githubusercontent.com/hariswb/0d835e86b95b264013638835361fb578/raw/f4534172b315e1bacb6dc1a9c5a5781714aa6839/playlist-tracks-data-json"

const metrics = ["popularity","danceability", "acousticness", "energy", "happiness","instrumentalness", "liveness", "speechiness"]

function averages(metrics,tracks){
  const result = []
  metrics.forEach((metric,index)=>{
    const mean = tracks.map(item=>item[metric]).reduce((x,y)=>x+y)/tracks.length
    const obj = {}
    obj["index"]=index
    obj["name"]=metric
    obj["value"]=metric == "popularity"?mean:mean*100
    result.push(obj)
  })
  return result
}

async function fetch_data(){
  const result = {} 
  // GEt JSON FILE
  const response = await fetch(ENDPOINT);
  const json = await response.json()
  // Process data
  result["metrics"]=metrics
  result["bulk"] = await json.data
  result["averages"] = await averages(metrics,result["bulk"])
  return result
}

module.exports.get_playlist = ()=>fetch_data()