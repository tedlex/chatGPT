import React from 'react';
import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Container from 'react-bootstrap/Container';
import './usage.css'
import TopBar from '../components/topBar';
import { apiURL } from '../config';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true
        }
    }
}

const parseData = function (data) {
    return {
        labels: data.map(row => row.date.slice(5)),
        datasets: [{
            label: 'gpt-3.5-turbo',
            data: data.map(row => row['gpt-3.5-turbo']),
            borderWidth: 1,
            backgroundColor: "rgba(53,162,235,0.5)",
            borderColor: 'rgba(53,162,235,1)'
        },
        {
            label: 'gpt-4',
            data: data.map(row => row['gpt-4']),
            borderWidth: 1,
            backgroundColor: 'rgba(255,98,132,0.5)',
            borderColor: 'rgba(255,98,132,1)'
        }]
    }
}

export default function Usage() {
    const [data, setData] = useState({ done: false })
    useEffect(() => {
        let ignore = false;
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiURL}/api/charts/data`, { credentials: 'include' });
                const res = await response.json();
                console.log(res)
                if (!ignore) {
                    setData({ done: true, options, data1: parseData(res.data1), data2: parseData(res.data2), cost: res.cost })
                } else {
                    console.log('ignore data')
                }
            } catch (e) {
                console.log(e)
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [])
    return (
        <>
            <TopBar />
            <Container style={{ marginTop: "80px", marginBottom: "80px" }}>
                <h1>Usage</h1>
                <p>Cost of this month: $<span id="cost">{data.cost}</span></p>
                <h2>Last 3 Days</h2>

                <div className='chartDiv mx-auto mb-3'>
                    {data && data.done && <Bar options={data.options} data={data.data1} />}
                </div>
                <h2>Last 30 Days</h2>
                <div className='chartDiv mx-auto mb-3'>
                    {data && data.done && <Bar options={data.options} data={data.data2} />}
                </div>
            </Container>
        </>
    )
}
