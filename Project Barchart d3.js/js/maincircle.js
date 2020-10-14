/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/
var flag = true; // Esta variable la vamos a usar para identificar qué dataset vamos a utilizar

var t = d3.transition().duration(500); // Esta es la variable que determina la duración de las transiciones

var margin = { left:100, right:10, top:10, bottom:100 };

var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    
d3.json("/data/revenues.json").then(
    data => { data.forEach(d => { 
        d.revenue = parseInt(d.revenue)
        d.profit = parseInt(d.profit)
    })
    
console.log("-----Esta es la información que está almacenando la variable \"data\":\n")
console.log(data)

    //Dentro de la etiqueta <svg>, se crea otra etiqueta <g> para agrupar todo
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

    // Procesamos los datos del eje x usando el método scaleBand y lo almacenamos en la variable "x"
    // El método scaleBand ajusta y distribuye automáticamente las barras dentro del área definida para el SVG
    // Hay que también tener en cuenta que más adelante vamos a hacerle un llamado a esta variable "x" con "d3.axisBottom(x)"
    // El domain recibe un array con el nombre de las categorías del eje X, en este caso ["January","February","March","April","May","June","July"]
    var x = d3.scaleBand()
        //.domain(data.map(d => { return d.month })) // Esta línea la vamos a usar en la update function
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);
    console.log("----data.map retorna:\n" + JSON.stringify(data.map(d => { return d.month })));

    // Procesamos los datos del eje "y" usando el método scaleLinear y lo almacenamos en la variable "y"
    // Cabe notar que el método "max" busca el valor máximo dentro del arreglo que le pasamos como parámetro
    var y = d3.scaleLinear()
        // .domain([0, d3.max(data, d => { return d.revenue })]) // Esta línea la vamos a usar en la update function
        .range([height, 0]);

    // Esta es la variable que controla la etiqueta HTML <g> del eje x
    var xAxisGroup = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")");

    // Esta es la variable que controla la etiqueta HTML <g> del eje y
    var yAxisGroup = g.append("g")
        .attr("class", "y axis");
        
    // Este es el título del eje X
    g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

    // Este es el título del eje Y
    var yLabel = g.append("text") // Esta etiqueta <g> la metemos en una variable porque necesitamos alterarla en la update function
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text(flag ? "Revenue" : "Profit");
        
    update(data); // Este llamado previo a nuestra función de update se hace para evitar el delay que se define en la función que se va a repetir indefinidamente (pruebe volviendo esta línea un comentario y verá que se demora en aparecer el eje)
    d3.interval( () => {
        var sliceData = flag ? data : data.slice(3);
        update(sliceData);
        flag = !flag;
    }, 1000);
    
    function update(data) {
        
        var value = flag ? "revenue" : "profit";
        // console.log("El valor de \"value\" es:\n" + value)
        
        yLabel.text(flag ? "Revenue" : "Profit");

        // Acá lo que estamos haciendo es actualizando los "domain" de los dos ejes
        x.domain(data.map(d => { return d.month }))
        y.domain([0, d3.max(data, d => { return d[value] * 1.3 })]); // Multiplicamos este valor para dejar un margen arriba

        // Dentro del primer tag <g>, añadimos otra etiqueta para agrupar la informnación del eje x
        // Hay que notar que usamos como parámetro la variable "x" previamente definida
        var xAxisCall = d3.axisBottom(x)
        xAxisGroup.transition(t).call(xAxisCall);
        
        // Ahora pasamos la información del eje y (contenida en la variable "y") a la variable yAxisCall
        // Y le decimos a d3 que ese va a ser nuestro eje izquierdo usando el método axisLeft(y)
        // Ticks es la densidad de separadores y los labels del eje se pueden formatear con .tickFormat
        var yAxisCall = d3.axisLeft(y)
            .ticks(8)
            .tickFormat( d => { return ("$" + d); });
        yAxisGroup.transition(t).call(yAxisCall);
    
        // JOIN new data with old elements
        // El método selectAll retorna todo lo que esté dentro de la etiqueta que se le pase como parámetro
        // En la siguiente línea lo que se hace es simplemente pasarle la "data" a la variable rect
        // Y decirle a d3 que esa variable va a controlar todas las etiquetas <rect> que hayan dentro de la etiqueta <g>
        var circles = g.selectAll("circle")
            .data(data, d => { return d.month; }); // La función que se pasa como segundo argumento le dice a D3 cuáles son las "keys" de los valores (Lección 44, 5:30)
        // console.log(circles); // Revise este console log para que vea lo que almacena la variable circles

        // EXIT old elements not present in new data but on screen
        circles.exit()
            .attr("fill", "red")
            .transition()
            .attr("cy", d => { return y(d[value]); })
            .attr("r", 0)
            .remove();

        // ENTER tiene la información que está en la data pero no en la pantalla
        circles.enter()
        .append("circle")
            .attr("cx", d => { return x(d.month) + (x.bandwidth() / 2); })
            .attr("width", x.bandwidth() )
            .attr("fill", "grey")
            .attr("r", 0)
            .attr("cy", d => { return y(d[value]); })
            // UPDATE elements in new data
            .merge(circles)
            .transition(t)
                .attr("cx", d => { return x(d.month) + (x.bandwidth() / 2); })
                .attr("width", x.bandwidth())
                .attr("cy", d => { return y(d[value]); })
                .attr("r", d => { return (height - y(d[value]))/7; }); // Acá dividimos para lograr una proporción que quepa en la pantalla
    };


}).catch(error => {console.log(error);})

var test = [{"a": 123, "b":456, "c":789}]

console.log(test.a)