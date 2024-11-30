export async function GET(req, res) {

    console.log("in the weather api page")

const res2 = await fetch('http://api.weatherapi.com/v1/current.json?key=6196b36fa9b2465382d140753242210&q=Dublin&aqi=no')

    const data = await res2.json()

    console.log(data.current.temp_c)

    let currentTemp = data.current.temp_c

    // at the end of the process we need to send something back.

    return Response.json({"temp": currentTemp})

}