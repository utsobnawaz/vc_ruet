document.getElementById("applicationForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const position = document.getElementById("position").value;

    // Redirect to the dashboard with query parameters
    window.location.href = `NEXT_section\dashboard\dashboard.html?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&position=${encodeURIComponent(position)}`;
});
app.use('/uploads', express.static('uploads'));
const response = await fetch("https://vc-ruet-backend.vercel.app/submit-form", {
    method: "POST",
    body: formData,
});

if (!response.ok) {
    throw new Error("Server error: " + response.statusText);
}

const result = await response.json();
