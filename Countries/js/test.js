d3.json("data/data.json").then(function(data){
    // console.log(data);

    var dataCopy = data;

    // console.log(dataCopy);

    var temp;
    var contador = 0;

    var array = dataCopy.map( year => {
        return year.countries.filter( country => {
            var filter = (country.income && country.life_exp);
            return filter;
        })
    })

    console.log(array)

    var x = [{'0':-33, '1':-28, '2':4, '3':35, '4':42, '5':-9, '6':-26, '7':-21, '8':-31, '9':26, '10':31, '11':50, '12':-48, '13':47, '14':19, '15':-39, '16':2, '17':-42, '18':44, '19':-3}];

    var z = [3, 12, 10, -30, -44, -18, 22, -46, -48, 49, 18, -37, 50, 34, -24, -3, 17, 40, -42, 27];

    // console.log(z)




    // Clean data
    const formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
    });

    console.log(formattedData);

});