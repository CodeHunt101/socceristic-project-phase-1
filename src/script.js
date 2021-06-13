const countryTargets = [
  "Spain",
  "Germany",
  "Italy",
  "France",
  "England",
  "Netherlands",
  "Brazil",
];

const apiCongigObj = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "v3.football.api-sports.io",
    "x-rapidapi-key": "774afab29cc8f4cde7bcb5ccbaf2872a",
  },
};

fetch(`https://v3.football.api-sports.io/countries`, apiCongigObj)
  .then((response) => response.json())
  .then((country) => {
    console.log(country.response.length);
    country.response.forEach((country) => {
      for (let i = 0; i < countryTargets.length; i++) {
        if (countryTargets[i] === country.name) {
          // document.getElementById('list-countries').appendChild(document.createElement('li')).appendChild(document.createElement('img')).setAttribute('src',country.flag)

          document
            .getElementById("list-countries")
            .appendChild(document.createElement("li")).className = "country";

          document
            .getElementsByClassName("country")
            [document.getElementsByClassName("country").length - 1].appendChild(
              document.createElement("span")
            ).className = "country-flag";
          document
            .getElementsByClassName("country-flag")
            [
              document.getElementsByClassName("country-flag").length - 1
            ].appendChild(document.createElement("img"))
            .setAttribute("src", country.flag);
          document
            .getElementsByClassName("country")
            [document.getElementsByClassName("country").length - 1].appendChild(
              document.createElement("span")
            ).className = "country-name";
          document.getElementsByClassName("country-name")[
            document.getElementsByClassName("country-name").length - 1
          ].textContent = countryTargets[i];
        }
      }
    });
    //  const countriesList = document.getElementsByClassName('country')
    //   for (let i = 0; i<countryTargets.length; i++) {
    //     countriesList[i].appendChild(document.createElement('span')).appendChild(document.createElement('img')).setAttribute('src',country.response[i].flag)
    //   }
  });

// fetch("https://v3.football.api-sports.io/countries", {
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-host": "v3.football.api-sports.io",
// 		"x-rapidapi-key": "774afab29cc8f4cde7bcb5ccbaf2872a"
// 	}
// })
// .then(response => response.json())
// .then(json => console.log(json))
