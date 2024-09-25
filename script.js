// Define the chart instance globally if needed outside
var myChart;
var milestoneChart;

// Helper function to perform calculation
// Helper function to perform calculation
function calculateEstimate() {
  const lessons = parseInt(document.getElementById('lessons').value);
  const teamSize = parseInt(document.getElementById('team-size').value);
  const commitment = parseFloat(document.getElementById('commitment').value) / 100;
  const availability = parseFloat(document.getElementById('availability').value) / 100;
  const rate = parseFloat(document.getElementById('rate').value);
  
  // Update slider labels dynamically
  document.getElementById('team-size-val').textContent = teamSize;
  document.getElementById('commitment-val').textContent = `${commitment * 100}%`;
  document.getElementById('availability-val').textContent = `${availability * 100}%`;
  document.getElementById('rate-val').textContent = rate;

  // Get the start date from the input
  const startDateInput = document.getElementById('start-date').value;
  const startDate = startDateInput ? new Date(startDateInput) : new Date(); // Use today as fallback

  if (lessons && teamSize && commitment && rate && !isNaN(startDate)) {
    // Calculate the total weeks based on input
    const totalSprints = lessons / (teamSize * commitment * availability * rate); 
    const totalWeeks = Math.ceil(3 * totalSprints); // Multiply by 3 since 1 sprint = 3 weeks
    document.getElementById('result').textContent = `${totalWeeks} weeks`;

    // Update the chart using the start date and total weeks
    generateTimeline(startDate, totalWeeks)
  //   updateMilestoneChart(startDate, totalWeeks);
  // } else {
  //   document.getElementById('result').textContent = "Please enter all values";
  //   if (milestoneChart) {
  //     milestoneChart.destroy(); // Destroy the chart if inputs are invalid
  //     milestoneChart = null;
  //   }
  }
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateEndDate(startDateInput, durationWeeks) {
  const startDate = new Date(startDateInput);
  const endDate = addDays(startDate, durationWeeks * 7); // 7 days per week
  document.getElementById('end-date').innerText = formatDate(endDate);
}

function generateTimeline(startDateInput, weeks) {
  const timelineContainer = document.getElementById('timeline');
  timelineContainer.innerHTML = '';  // Clear previous timeline

  const startDate = new Date(startDateInput);
  const totalDays = weeks * 7;
  const completionPercentages = [0, 25, 50, 75, 100];

  // Create the horizontal line
  const line = document.createElement('div');
  line.className = 'line';
  timelineContainer.appendChild(line);

  // Get the container width to position ticks relative to the line
  const containerWidth = timelineContainer.offsetWidth;

  // Create ticks and labels for 0%, 25%, 50%, and 100% completion
  completionPercentages.forEach(percentage => {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'percentage-label';
    labelDiv.style.left = `${percentage}%`;
    labelDiv.innerText = `${percentage}%`;
    document.getElementById('timeline').appendChild(labelDiv);
    const tick = document.createElement('div');
    tick.className = 'tick';

    // Position the tick relative to the container width
    tick.style.left = `${(percentage / 100) * containerWidth}px`;
    timelineContainer.appendChild(tick);

    // Calculate the date corresponding to the percentage
    const daysForTick = Math.floor((percentage / 100) * totalDays);
    const tickDate = addDays(startDate, daysForTick);

    const label = document.createElement('div');
    label.className = 'tick-label';
    label.innerText = formatDate(tickDate);
    tick.appendChild(label);
  });
  calculateEndDate(startDateInput, weeks);
}

// Function to update the chart with project progress
function updateMilestoneChart(startDate, weeks) {
  const ctx = document.getElementById('milestoneChart').getContext('2d');
  
  // Calculate the end date
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + weeks * 7); // Add the total weeks to the start date
  
  const milestonePortions = [0, 0.25, 0.5, 0.75, 1];
  const milestones = milestonePortions.map(portion => {
      const milestoneDate = new Date(startDate.getTime());
      milestoneDate.setDate(startDate.getDate() + (portion * weeks * 7));
      return milestoneDate;
  });

  const data = {
      labels: milestones,
      datasets: [{
          label: 'Project Completion',
          data: new Array(milestones.length).fill(1), // Array of 1s to create a straight line
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: 'rgb(75, 192, 192)'
      }]
  };

  const config = {
      type: 'line',
      data: data,
      options: {
          scales: {
              xAxes: [{
                  type: 'time',
                  time: {
                      unit: 'day', // Day-level ticks only
                      tooltipFormat: 'MM/DD/YYYY', // Tooltip format
                      displayFormats: {
                          day: 'MM/DD/YYYY' // X-axis label format
                      }
                  },
                  scaleLabel: {
                      display: true,
                      labelString: 'Date'
                  },
                  ticks: {
                      source: 'labels' // Use only the provided milestone labels
                  }
              }],
              yAxes: [{
                  display: false // Hide the Y-axis as it's not necessary
              }]
          },
          plugins: {
              legend: {
                  display: false // Hide legend
              }
          },
          maintainAspectRatio: false,
          tooltips: {
              callbacks: {
                  label: function(tooltipItem, data) {
                      return `Milestone ${milestonePortions[tooltipItem.index] * 100}% Completion: ${tooltipItem.label}`;
                  }
              }
          }
      }
  };

  if (window.milestoneChart instanceof Chart) {
      window.milestoneChart.destroy();
  }
  window.milestoneChart = new Chart(ctx, config);
}

// Event listeners for real-time updates
document.getElementById('lessons').addEventListener('input', calculateEstimate);
document.getElementById('team-size').addEventListener('input', calculateEstimate);
document.getElementById('commitment').addEventListener('input', calculateEstimate);
document.getElementById('availability').addEventListener('input', calculateEstimate);
document.getElementById('rate').addEventListener('input', calculateEstimate);
document.getElementById('start-date').addEventListener('input', calculateEstimate); 
document.addEventListener('DOMContentLoaded', function() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Set the default value of the start-date input
  document.getElementById('start-date').value = today;
});

// Validation and initial calculation
document.addEventListener('DOMContentLoaded', function() {
  calculateEstimate(); // This calculates and updates the chart based on the default values
});
