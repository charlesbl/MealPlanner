import type { APIResponsePayload } from "./schemas/common.schemas.js";
import type {
    UpdateProfileRequest,
    UserProfile,
} from "./schemas/profile.schemas.js";
import { getApiBase } from "./utils.js";

async function fetchProfile(
    token: string,
): Promise<{ profile: UserProfile; tdee: number | null }> {
    const res = await fetch(`${getApiBase()}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch profile failed: ${res.status}`);
    const body: APIResponsePayload<{
        profile: UserProfile;
        tdee: number | null;
    }> = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

async function updateProfile(
    patch: UpdateProfileRequest,
    token: string,
): Promise<{ profile: UserProfile; tdee: number | null }> {
    const res = await fetch(`${getApiBase()}/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Update profile failed: ${res.status}`);
    const body: APIResponsePayload<{
        profile: UserProfile;
        tdee: number | null;
    }> = await res.json();
    if (body.status === "error") throw new Error(body.error);
    return body.data;
}

export const profileService = { fetchProfile, updateProfile };
