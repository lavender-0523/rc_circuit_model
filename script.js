document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sliderR = document.getElementById('slider-r');
    const sliderC = document.getElementById('slider-c');
    const sliderV = document.getElementById('slider-v');
    const sliderT = document.getElementById('slider-t');

    const displayR = document.getElementById('display-r');
    const displayC = document.getElementById('display-c');
    const displayV = document.getElementById('display-v');
    const displayT = document.getElementById('display-t');

    const valR = document.getElementById('val-r');
    const valC = document.getElementById('val-c');
    const valV = document.getElementById('val-v');
    const valTau = document.getElementById('val-tau');

    // Chart setup
    const ctx = document.getElementById('rcChart').getContext('2d');
    
    // Global chart instance
    let rcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Mathematical (Analytical)',
                    borderColor: '#00C9FF',
                    borderWidth: 4,
                    borderDash: [5, 5],
                    data: [],
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'Computational (Euler ODE Solver)',
                    borderColor: '#92FE9D',
                    borderWidth: 2,
                    data: [],
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Turn off global load animations
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#f0f0f0', font: { family: 'Inter', size: 14 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#00C9FF',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Time (s)', color: '#b0bec5' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#b0bec5' }
                },
                y: {
                    title: { display: true, text: 'Voltage (V)', color: '#b0bec5' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#b0bec5' },
                    suggestedMin: 0
                }
            }
        }
    });

    function updateModel() {
        // Parse inputs
        const R = parseFloat(sliderR.value);
        const C_uF = parseFloat(sliderC.value);
        const Vs = parseFloat(sliderV.value);
        const t_max = parseFloat(sliderT.value);
        
        // Update display text inside sliders
        displayR.textContent = R;
        displayC.textContent = C_uF;
        displayV.textContent = Vs.toFixed(1);
        displayT.textContent = t_max.toFixed(1);

        // Update metrics cards
        valR.textContent = R + " \u03A9";
        valC.textContent = C_uF + " \u03BCF";
        valV.textContent = Vs.toFixed(1) + " V";

        // C in Farads
        const C = C_uF * 1e-6;
        
        // Time Constant
        const tau = R * C;
        valTau.textContent = tau.toFixed(4) + " s";

        const num_points = 200;
        const dt = t_max / num_points;

        let time_array = [];
        let analytical_array = [];
        let numerical_array = [];

        // ODE Solver initial conditions
        let Vc_numerical = 0; // Starts at 0V

        for (let i = 0; i <= num_points; i++) {
            let t = i * dt;
            time_array.push(t.toFixed(4));

            // 1. Analytical Equation
            // Vc(t) = Vs * (1 - e^(-t / rc))
            let Vc_analytical = Vs * (1 - Math.exp(-t / tau));
            analytical_array.push(Vc_analytical);

            // 2. Numerical ODE Solver (Euler Method)
            // dVc/dt = (Vs - Vc) / (R * C)
            numerical_array.push(Vc_numerical);
            
            // Calculate next step
            let dVc_dt = (Vs - Vc_numerical) / tau;
            Vc_numerical = Vc_numerical + (dVc_dt * dt);
        }

        // Update Chart
        rcChart.data.labels = time_array;
        rcChart.data.datasets[0].data = analytical_array;
        rcChart.data.datasets[1].data = numerical_array;
        
        // Adjust y-axis max to give a little headroom above Vs
        rcChart.options.scales.y.suggestedMax = Vs * 1.1;
        
        // Pass 'none' to disable Chart.js default line-drawing animations
        // This solves the 'graph rubber-banding/extending' visual bug completely!
        rcChart.update('none');
    }

    // Attach event listeners to sliders
    sliderR.addEventListener('input', updateModel);
    sliderC.addEventListener('input', updateModel);
    sliderV.addEventListener('input', updateModel);
    sliderT.addEventListener('input', updateModel);

    // Initial render
    updateModel();
});
