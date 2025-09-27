import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class lineareachart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    height: 350,
                    type: 'area',
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 3,
                },
                
                colors: ['#556ee6'],
                xaxis: {
                    type: 'datetime',
                    categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],                
                },
                grid: {
                    borderColor: '#f1f1f1',
                },
                tooltip: {
                    x: {
                        format: 'dd/MM/yy HH:mm'
                    },
                }
            },
            series: [{
                name: 'series1',
                data: [34, 40, 28, 52, 42, 109, 100]
            }]
        }
    }
    render() {
        return (
            <React.Fragment>
                <ReactApexChart options={this.state.options} series={this.state.series} type="area" height="300px" />
            </React.Fragment>
        );
    }
}

export default lineareachart;