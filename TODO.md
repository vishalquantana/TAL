# TODO: Make Student Form Fields Mandatory

- [x] Rename "Number" field to "Parent Number" in src/studentform.js
- [x] Add visual "*" indicator to First Name, Last Name, and Email labels
- [x] Ensure First Name, Last Name, Email, and Parent Number have 'required' attribute
- [x] Fix state binding for Email field (change value from formData.whatsapp to formData.email)
- [x] Fix duplicate contact fields: Change "Whatsapp Number" to use name="whatsapp" and remove 'required'; make "Student Number" optional or remove if not needed
- [x] Add form-level validation in handleSubmit to alert if mandatory fields are empty
- [x] Test the form to ensure mandatory fields prevent submission and show indicators
