document.addEventListener('DOMContentLoaded', function() {
// Initialize the map
    const map = L.map('map').setView([35.7796, -78.6382], 7); // Default to NC center

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);
            marker = L.marker([latitude, longitude]).addTo(map)
                .bindPopup("Your Current Location").openPopup();
            updateCoordinates(latitude, longitude);
        }, () => {
            console.warn('Geolocation failed. Defaulting to NC center.');
        });
    }

    // Allow clicking on map to select location
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;

        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng]).addTo(map);
        }

        marker.bindPopup(`Selected Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
        updateCoordinates(lat, lng);
    });

    // Update form fields with coordinates
    function updateCoordinates(lat, lng) {
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
        document.getElementById('coordinates').innerText = `Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`;
    }

	// Generate UUID
	function generateUUID() {
	    const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
	    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random uppercase letter (A-Z)
	    return numbers + letter;
	}


// Auto-fill the report number on page load
    const reportNumberInput = document.getElementById('report_number');
    reportNumberInput.value = generateUUID();




	const updateSection = document.getElementById('updateRecord');
    updateSection.style.display = 'none';

	//Create and add spinner to the page
    const spinner = document.createElement('div');
    spinner.id = 'spinner';
    spinner.style.display = 'none';
    spinner.style.position = 'fixed';
    spinner.style.top = '50%';
    spinner.style.left = '50%';
    spinner.style.transform = 'translate(-50%, -50%)';
    spinner.style.border = '8px solid #f3f3f3';
    spinner.style.borderTop = '8px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '60px';
    spinner.style.height = '60px';
    spinner.style.animation = 'spin 1s linear infinite';
    document.body.appendChild(spinner);

    // Spinner animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);


	// JavaScript to toggle the visibility of the Update Existing Record section
	document.getElementById('toggleUpdateRecord').addEventListener('click', function () {
		//const updateSection = document.getElementById('updateRecord');
		if (updateSection.style.display === 'none') {
		    updateSection.style.display = 'block';
		} else {
		    updateSection.style.display = 'none';
		}
	});

	// Handle fetching existing record for update
	document.getElementById('fetchRecord').addEventListener('click', function() {

		const report_number = document.getElementById('updateReportNumber').value;
		const email = document.getElementById('updateEmail').value;

		if (!report_number) {
			alert('Please select an Report Number and Email Used for Initial Submission.');
			return; // Exit early if inputs are invalid
		}

		spinner.style.display = 'block'; //show spinner
		
		// Fetch the existing record from the database
		fetch(`https://jo2nv77ox9.execute-api.us-east-1.amazonaws.com/getRecord?report_number=${report_number}&email=${encodeURIComponent(email)}`)
			.then(response => {
				if (response.status === 404) {
					// Handle 404 specifically
					alert('No record found for the provided Report Number and Email.');
					throw new Error('Record not found.');
				} else if (!response.ok) {
					// Handle other non-OK responses
					throw new Error('Failed to fetch record. Status code: ' + response.status);
				}
				return response.json();
			})
			
			.then(data => {
				if (data) {
					// Populate the form fields with the fetched data
					document.getElementById('operator').value = data.operator;
					document.getElementById('email').value = data.email;
					document.getElementById('troop').value = data.troop;
					document.getElementById('report_number').value = data.report_number;
					document.getElementById('number_of_trucks').value = data.number_of_trucks;	
					document.getElementById('number_of_citations').value = data.number_of_citations;	
					document.getElementById('district').value = data.district;
					document.getElementById('date').value = data.date;
					document.getElementById('start_time').value = data.start_time;
					document.getElementById('end_time').value = data.end_time;
					document.getElementById('latitude').value = data.latitude;
					document.getElementById('longitude').value = data.longitude;

					const lat = parseFloat(data.latitude);
					const lng = parseFloat(data.longitude);

					if (!isNaN(lat) && !isNaN(lng)) { // Check if lat and lng are valid numbers
					    if (marker) {
					        marker.setLatLng([lat, lng]).bindPopup(`Selected Location: ${lat}, ${lng}`).openPopup();
					    } else {
					        marker = L.marker([lat, lng]).addTo(map).bindPopup(`Selected Location: ${lat}, ${lng}`).openPopup();
					    }
					    map.setView([lat, lng], 13);
					} else {
					    console.warn('Invalid latitude or longitude:', lat, lng);
					}

					updateCoordinates(lat, lng);


					console.log("Latitude:", data.latitude);
					console.log("Longitude:", data.longitude);
					

					//console.log('other_violations:', data.other_violations);
					
					alert('Record found for the provided Inspection Number and Email.');
				} else {
					alert('No record found for the provided Inspection number and email.');
				}
			})
			.catch(error => console.error('Error fetching record:', error))

			.finally(() => spinner.style.display = 'none'); //hide spinner

	});

	// Handle posting record
	document.getElementById('userForm').addEventListener('submit', function(event) {
		event.preventDefault();
		
		const operator = document.getElementById('operator').value;
		const email = document.getElementById('email').value;
		const troop = document.getElementById('troop').value;
		const district = document.getElementById('district').value;
		const date = document.getElementById('date').value;
		const start_time = document.getElementById('start_time').value;
		const end_time = document.getElementById('end_time').value;
		const report_number = document.getElementById('report_number').value;
		const number_of_trucks = document.getElementById('number_of_trucks').value;
		const number_of_citations = document.getElementById('number_of_citations').value;
		const latitude = document.getElementById('latitude').value;
		const longitude = document.getElementById('longitude').value;



		//Validate the form fields
		if (!operator || !report_number || !email || !troop || !date || !start_time || !end_time || !district || !number_of_trucks || !number_of_citations) {
			alert('Please fill in all required fields.');
		 	return; // Exit if any field is empty
		 }

		// Validate email format with Regular Expression (Regex)
		 const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		 if (!emailPattern.test(email)) {
		 	alert('Please enter a valid email address.');
		 	return; // Exit if email format is invalid
		 }
		
		 // Validate inspection number format
/*		 if (!/^\d{7}$/.test(report_number)) {
		 	alert('The Inspection Number field must be exactly 7 digits.');
		 	return; // Exit if validation fails
		 }
*/

		
		// Prepare the form data for submission
		const formData = {
			operator,
			report_number,
			email,
			troop,
			district,
			date,
			start_time,
			end_time,
			number_of_trucks,
			number_of_citations,
			latitude,
			longitude
		};

		spinner.style.display = 'block'; //show spinner
		
		// Post the record to the database
		fetch('https://jo2nv77ox9.execute-api.us-east-1.amazonaws.com/postRecord', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		})
		.then(response => {
			if (response.ok) return response.json();
			throw new Error('Network response was not ok.');
		})
		.then(data => {
			alert(data.message || 'Record created/updated successfully.');
			console.log('Response:', data);

			// Clear the form upon successful submission
			document.getElementById('userForm').reset();

			// Refresh the page after submission
			window.location.reload();
		})
		.catch(error => {
			alert('There was a problem with your submission.');
			console.error('Error:', error);
		})

		.finally(() => spinner.style.display = 'none'); // hide spinner

	});
});

// Set default date and time
window.onload = function() {
	const today = new Date();
	document.getElementById('date').value = today.toISOString().split('T')[0];
	document.getElementById('end_time').value = today.toTimeString().split(' ')[0].slice(0, 5);
};
