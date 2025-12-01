// src/StudentForm.js
import React, { useState, useEffect } from "react";
import "./StudentForm.css";
import VolunteerProfile from "./VolunteerProfile";
import supabase from "./supabaseClient";

export default function StudentForm() {
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;

        if (data?.user) {
          setVolunteerEmail(data.user.email);
        }
      } catch (err) {
        console.error("getUser error:", err);
      }
    };
    getUser();
  }, []);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    dob: "",
    age: "",
    pob: "",
    camp_name: "",
    nationality: "",
    address: "",
    class: "",
    educationCategory: "",
    educationYear: "",
    email: "",
    contact: "",
    whatsapp: "",
    student_contact: "",
    school: "",
    branch: "",
    prev_percent: "",
    present_percent: "",
    fee: "",
    job: "",
    aspiration: "",
    scholarship: "",
    certificates: "",
    years_area: "",
    parents_full_names: "",
    family_members: "",
    earning_members: "",
    account_no: "",
    bank_name: "",
    bank_branch: "",
    ifsc_code: "",
    special_remarks: "",
  });

  const [files, setFiles] = useState({
    school_id: null,
    aadhaar: null,
    income_proof: null,
    marksheet: null,
    passport_photo: null,
    fees_receipt: null,
    volunteer_signature: null,
    student_signature: null,
  });

  // -------------------------------
  // ⭐ PHONE NUMBER VALIDATION HERE
  // -------------------------------
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;

    // keep only digits
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length <= 10) {
      setFormData({ ...formData, [name]: numericValue });
    }
  };
  // -------------------------------

  // Education dropdown options
  const educationOptions = {
    School: ["8th", "9th", "10th", "Other"],
    Intermediate: ["11th", "12th", "Other"],
    Engineering: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"],
    "Medical Field": ["1st Year", "2nd Year", "3rd Year", "Internship", "Other"],
    Degree: ["1st Year", "2nd Year", "3rd Year", "Other"],
    "Diploma / Polytechnic": ["1st Year", "2nd Year", "3rd Year", "Other"],
    "Post-Graduation (PG)": ["1st Year", "2nd Year", "Other"],
    Other: ["Other"],
  };

  const educationCategories = Object.keys(educationOptions);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
       let computedAge = "";
        if (value) { const dobDate = new Date(value); 
          const today = new Date(); let ageYears = today.getFullYear() - dobDate.getFullYear(); 
          const m = today.getMonth() - dobDate.getMonth(); 
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) { ageYears--; }
           computedAge = ageYears >= 0 ? String(ageYears) : ""; }
            setFormData({ ...formData, dob: value, age: computedAge }); 
            return; 
          }

    if (name === "educationCategory") {
      setFormData({ ...formData, educationCategory: value, educationYear: "" });
      return;
    }

    if (name === "educationYear") {
      const combinedClass = value ? `${formData.educationCategory} - ${value}` : "";
      setFormData({ ...formData, educationYear: value, class: combinedClass });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [field]: file });
    }
  };

  const uploadFileToStorage = async (file, folder) => {
    if (!file) return null;

    const fileName = `${Date.now()}_${file.name}`.replace(/\s+/g, "_");
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("student_documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from("student_documents")
      .getPublicUrl(filePath);

    return publicData?.publicUrl ?? null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validating required fields
    const mandatoryFields = [
      { key: "age", label: "Age" },
      { key: "address", label: "Address" },
      { key: "whatsapp", label: "Whatsapp Number" },
      { key: "school", label: "Name of School/College" },
      { key: "class", label: "Class" },
      { key: "prev_percent", label: "Previous Year Percentage" },
      { key: "present_percent", label: "Present Year Percentage" },
      { key: "parents_full_names", label: "Parents Full Names" },
      { key: "earning_members", label: "Earning Members" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "contact", label: "Parent Number" },
    ];

    const missing = mandatoryFields.filter((f) => {
      const v = (formData[f.key] || "").toString().trim();
      return v === "";
    });

    if (missing.length > 0) {
      alert(
        "⚠️ Please fill in all mandatory fields: " +
          missing.map((m) => m.label).join(", ")
      );
      return;
    }

    // Age check 
    const ageVal = formData.age !== "" && formData.age !== null ? Number(formData.age) : null;
     if (ageVal === null || Number.isNaN(ageVal) || ageVal < 6) { alert("⚠️ Age must be at least 6 years."); 
      return; }

    // Validate 10-digit phone numbers
    if (
      formData.contact.length !== 10 ||
      formData.whatsapp.length !== 10 ||
      (formData.student_contact && formData.student_contact.length !== 10)
    ) {
      alert("⚠️ Phone numbers must be exactly 10 digits.");
      return;
    }

    if (!volunteerEmail) {
      alert("⚠️ Volunteer not logged in.");
      return;
    }

    const studentFolder = `${formData.first_name}_${formData.last_name}_${Date.now()}`.replace(/\s+/g, "_");

    const uploadedFileUrls = {};

    for (const fKey of Object.keys(files)) {
      if (files[fKey]) {
        try {
          const url = await uploadFileToStorage(files[fKey], studentFolder);
          uploadedFileUrls[fKey] = url;
        } catch {
          uploadedFileUrls[fKey] = null;
        }
      }
    }

    const payload = {
      ...formData,
      volunteer_email: volunteerEmail,
      created_at: new Date().toISOString(),
      school_id_url: uploadedFileUrls.school_id ?? null,
      aadhaar_url: uploadedFileUrls.aadhaar ?? null,
      income_proof_url: uploadedFileUrls.income_proof ?? null,
      marksheet_url: uploadedFileUrls.marksheet ?? null,
      passport_photo_url: uploadedFileUrls.passport_photo ?? null,
      fees_receipt_url: uploadedFileUrls.fees_receipt ?? null,
      volunteer_signature_url: uploadedFileUrls.volunteer_signature ?? null,
      student_signature_url: uploadedFileUrls.student_signature ?? null,
    };

    const { error: insertError } = await supabase
      .from("student_details")
      .insert([payload]);

    if (insertError) {
      alert("❌ Error saving form.");
      return;
    }

    alert("🎉 Form submitted successfully!");

    setFormData({
      first_name: "",
      last_name: "",
      middle_name: "",
      dob: "",
      age: "",
      pob: "",
      camp_name: "",
      nationality: "",
      address: "",
      class: "",
      email: "",
      contact: "",
      whatsapp: "",
      student_contact: "",
      school: "",
      branch: "",
      prev_percent: "",
      present_percent: "",
      fee: "",
      job: "",
      aspiration: "",
      scholarship: "",
      certificates: "",
      years_area: "",
      parents_full_names: "",
      family_members: "",
      earning_members: "",
      account_no: "",
      bank_name: "",
      bank_branch: "",
      ifsc_code: "",
      special_remarks: "",
    });

    setFiles({
      school_id: null,
      aadhaar: null,
      income_proof: null,
      marksheet: null,
      passport_photo: null,
      fees_receipt: null,
      volunteer_signature: null,
      student_signature: null,
    });
  };

  const renderUploadField = (label, field) => (
    <div className="upload-field">
      <span className="label">{label}</span>
      <div className="upload-controls">
        <label className="upload-btn">
          <span className="plus-icon">+</span>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, field)}
          />
        </label>

        {files[field] && (
          <span className="file-info">
            <span className="tick">✓</span> {files[field].name}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="form-container">
      <VolunteerProfile />
      <h1 className="form-title">STUDENT APPLICATION FORM</h1>

      <form onSubmit={handleSubmit}>
        <div className="section">
          <h2>1. Personal Data</h2>

          <div className="form-group">
            <label>
              First Name<span className="required">*</span>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
            </label>

            <label>
              Middle Name
              <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} />
            </label>

            <label>
              Last Name<span className="required">*</span>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
            </label>
          </div>

          <div className="form-group"> 
            <label> Date of Birth <input type="date"
             name="dob" 
             value={formData.dob} 
             onChange={handleInputChange}
              min="1980-01-01" 
              max="2024-12-31" required />
               </label> 
               <label> 
                <span className="field-label">Age<span className="required">*</span>
                </span> <input type="number" name="age" 
                value={formData.age} min={6} readOnly className="readonly-age"
                 onChange={handleInputChange} /> 
                 </label> 
                 
            
            <label>
              Date of Camp
              <input type="text" name="pob" value={formData.pob} onChange={handleInputChange} />
            </label>

            <label>
              Name of Camp
              <input type="text" name="camp_name" value={formData.camp_name} onChange={handleInputChange} />
            </label>

            <label className="full-width">
              Address<span className="required">*</span>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
            </label>
          </div>

          <div className="form-group">
            <label>
              Parent Number<span className="required">*</span>
              <input type="text" name="contact" value={formData.contact} onChange={handlePhoneChange} maxLength="10" required />
            </label>

            <label>
              Whatsapp Number<span className="required">*</span>
              <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handlePhoneChange} maxLength="10" required />
            </label>

            <label>
              Student Number
              <input type="text" name="student_contact" value={formData.student_contact} onChange={handlePhoneChange} maxLength="10" />
            </label>

            <label>
              Email<span className="required">*</span>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </label>
          </div>

          <label className="full-width">
            Who all are there in the family?<span className="required">*</span>
            <input type="text" name="family_members" value={formData.family_members} onChange={handleInputChange} required />
          </label>

          <label className="full-width">
            Parents Full Names<span className="required">*</span>
            <input type="text" name="parents_full_names" value={formData.parents_full_names} onChange={handleInputChange} required />
          </label>

          <label className="full-width">
            Who are the earning members and their Occupation?<span className="required">*</span>
            <input type="text" name="earning_members" value={formData.earning_members} onChange={handleInputChange} required />
          </label>
        </div>

        {/* ..... other sections remain unchanged ..... */}

        <div className="submit-container">
          <button type="submit">Submit Application</button>
        </div>
      </form>
    </div>
  );
}
