const API_URL = "http://localhost:8000";

export const fetchObservations = async (verified, species) => {
    const params = new URLSearchParams();
    if (verified !== undefined) params.append("verified", verified);
    if (species) params.append("species", species);
    const res = await fetch(`${API_URL}/observations?${params.toString()}`);
    return res.json();
};

export const fetchObservation = async (id) => {
    const res = await fetch(`${API_URL}/observations/${id}`);
    if (!res.ok) throw new Error("Observation not found");
    return res.json();
};

export const createObservation = async (data) => {
    const res = await fetch(`${API_URL}/observations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });
    return res.json();
};

export const likeObservationDb = async (id, user) => {
    const res = await fetch(`${API_URL}/observations/${id}/like?user=${encodeURIComponent(user)}`, {
    method: "POST",
    });
    return res.json();
};

export const fetchComments = async (id) => {
    const res = await fetch(`${API_URL}/observations/${id}/comments`);
    return res.json();
};

export const createComment = async (id, commentData) => {
    const res = await fetch(`${API_URL}/observations/${id}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
    });
    return res.json();
};

export const fetchSpecies = async () => {
    const res = await fetch(`${API_URL}/species`);
    return res.json();
};

export const identifySpeciesApi = async (imageUrl) => {
    const res = await fetch(`${API_URL}/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl }),
    });
    return res.json();
};

export const fetchDataset = async () => {
    const res = await fetch(`${API_URL}/dataset`);
    return res.json();
};

export const updateDatasetStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/dataset/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    });
    return res.json();
};
