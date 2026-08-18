import * as THREE from "three";

// Supabase and API integration
import { supabase } from "./src/supabase.js";
import { getAPOD as getNewAPOD, getNEOFeed, getMarsPhotos as getNewMarsPhotos } from "./src/api.js";

import {
    getAPOD,
    getNearEarthObjects,
    getMarsPhotos
} from "./nasa.js";