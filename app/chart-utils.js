class HistoryChart {

  constructor(numOfColonies, colors = null) {
    this.numOfColonies = numOfColonies;
    this.colors = colors;
    this.config = {
      type: 'line',
      options: {
        beginAtZero: true,
        responsive: true,
        title: {
          display: true,
          text: 'Colonies History'
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          }]
        }
      },
      data: {
        labels: [],
        datasets: []
      }
    };

    for (let colony = 0; colony < numOfColonies; colony += 1) {
      let dataset = {
        label: `Colony ${colony}`,
        borderColor: this.colors[colony],
        data: []
      }
      this.config.data.datasets.push(dataset);
    }

    this.ctx = document.getElementById('line-chart').getContext('2d');
    this.myLine = new Chart(this.ctx, this.config);
  }

  pushData(tickData, tick) {
    for (let colony = 0; colony < this.numOfColonies; colony++) {
      this.config.data.datasets[colony].data.push(tickData[colony]);
    }
    this.config.data.labels.push(tick);
    this.myLine.update();
  }
}
