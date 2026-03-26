from typing import List

# In-memory storage
observations: List[dict] = [
    {"id": 1, "species": "Ara macao", "commonName": "Guacamayo Escarlata", "lat": 6.3, "lng": -61.5, "user": "carlos_bio", "date": "2024-03-15", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Beautiful_red_macaw.jpg/640px-Beautiful_red_macaw.jpg", "likes": 24, "comments": 5, "verified": True, "likedBy": [], "notes": "Observado en Canaima.", "dataset_status": None},
    {"id": 2, "species": "Pteronura brasiliensis", "commonName": "Nutria Gigante", "lat": 7.2, "lng": -63.1, "user": "maria_eco", "date": "2024-03-20", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Pteronura_brasiliensis_-_giant_otter.jpg/640px-Pteronura_brasiliensis_-_giant_otter.jpg", "likes": 31, "comments": 8, "verified": True, "likedBy": [], "notes": "Familia de 5 individuos.", "dataset_status": None},
    {"id": 3, "species": "Morpho helenor", "commonName": "Mariposa Morpho", "lat": 5.8, "lng": -62.3, "user": "ana_nat", "date": "2024-04-01", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Beautiful_blue_morpho_butterfly.jpg/640px-Beautiful_blue_morpho_butterfly.jpg", "likes": 15, "comments": 2, "verified": False, "likedBy": [], "notes": "Especie azul iridiscente.", "dataset_status": None},
    {"id": 4, "species": "Tapirus terrestris", "commonName": "Tapir Amazónico", "lat": 6.8, "lng": -63.5, "user": "pedro_campo", "date": "2024-04-05", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Tapirus_terrestris_001.JPG/640px-Tapirus_terrestris_001.JPG", "likes": 42, "comments": 12, "verified": True, "likedBy": [], "notes": "Huellas frescas.", "dataset_status": None},
    {"id": 5, "species": "Harpia harpyja", "commonName": "Águila Arpía", "lat": 7.5, "lng": -61.8, "user": "luis_bird", "date": "2024-04-10", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Harpia_harpyja_001.jpg/640px-Harpia_harpyja_001.jpg", "likes": 58, "comments": 18, "verified": True, "likedBy": [], "notes": "Nido activo.", "dataset_status": None},
]

comments_db: dict = {1: [], 2: [], 3: [], 4: [], 5: []}
next_id = 6

def get_next_id():
    global next_id
    current_id = next_id
    next_id += 1
    return current_id
