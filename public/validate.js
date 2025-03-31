document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gigForm");

    form.addEventListener("submit", (event) => {
        let isValid = true;

        // Clear previous error messages
        document.querySelectorAll(".error").forEach(error => error.textContent = "");

        // Validate Title
        const title = document.getElementById("title").value.trim();
        if (!title) {
            document.getElementById("titleError").textContent = "Title is required.";
            isValid = false;
        }

        // Validate Date (must be in the future)
        const dateInput = document.getElementById("date").value;
        const selectedDate = new Date(dateInput);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date

        if (!dateInput) {
            document.getElementById("dateError").textContent = "Date is required.";
            isValid = false;
        } else if (selectedDate < today) {
            document.getElementById("dateError").textContent = "Date must be in the future.";
            isValid = false;
        }

        // Validate Location
        const location = document.getElementById("location").value.trim();
        if (!location) {
            document.getElementById("locationError").textContent = "Location is required.";
            isValid = false;
        }

        if (!isValid) {
            event.preventDefault(); // Stop form submission if there are errors
        }
    });
});
