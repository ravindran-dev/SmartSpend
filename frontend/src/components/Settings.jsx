import React, { useState } from "react";

export default function Settings() {
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleLogout = () => {
    // TODO: Add logout logic
    alert("Logged out!");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full mx-auto mb-4">
        <h2 className="font-semibold mb-4">User Settings</h2>
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-2">
            <img
              src={profilePhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(username)}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer shadow" title="Change photo">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <span className="text-xs">✎</span>
            </label>
          </div>
          <span className="font-semibold text-lg">{username}</span>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="Enter username" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Email ID</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="Enter email" />
        </div>
      </div>
      <button className="bg-red-500 text-white px-4 py-2 rounded shadow w-full max-w-md" onClick={handleLogout}>Logout</button>
    </div>
  );
}
