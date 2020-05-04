/**
 * Line chart provided by Chart.js which draws the evolution of some data points over time for
 * all of the ant colonies.
 */
class AntsChart {

  /**
   * @param numOfColonies - the number of colonies
   * @param colors - the colors of the colonies (colors[i] - color for ith colony)
   * @param chartId - the HTML id of the chart
   * @param title - the title for the chart (optional)
   */
  constructor(numOfColonies, colors, chartId, title = 'N/A') {
    this.numOfColonies = numOfColonies;
    this.colors = colors;
    this.config = {
      type: 'line',
      options: {
        beginAtZero: true,
        responsive: true,
        title: {
          display: true,
          text: title
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

    this.ctx = document.getElementById(chartId).getContext('2d');
    this.myLine = new Chart(this.ctx, this.config);
  }

  /**
   * Pushed a set of data point for the same moment in time.
   * @param data - list of real values (data.length must be equal to the number of colonies)
   * @param tick - the moment in time
   */
  pushData(data, tick) {
    if (data.length !== this.numOfColonies) {
      throw new Error("Data size not equal to number of colonies");
    }

    for (let colony = 0; colony < this.numOfColonies; colony++) {
      this.config.data.datasets[colony].data.push(data[colony]);
    }
    this.config.data.labels.push(tick);
    this.myLine.update();
  }
}
