import type { APIResponsePayload } from "./schemas/common.schemas.js";
import type {
    UpdateProfileRequest,
    UserProfile,
} from "./schemas/profile.schemas.js";
import { getApiBase } from "./utils.js";

type ProfilePayloadFlat = UserProfile & { tdee: number | null };
type ProfilePayloadNested = {
    profile: UserProfile;
    tdee: number | null;
};

function normalizeProfilePayload(
    data: ProfilePayloadFlat | ProfilePayloadNested,
): ProfilePayloadNested {
    if ("profile" in data) return data;
    const { tdee, ...profile } = data;
    return { profile, tdee };
}

async function fetchProfile(
    token: string,
): Promise<{ profile: UserProfile; tdee: number | null }> {
    const res = await fetch(`${getApiBase()}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch profile failed: ${res.status}`);
    const body: APIResponsePayload<ProfilePayloadFlat | ProfilePayloadNested> =
        await res.json();
    if (body.status === "error") throw new Error(body.error);
    return normalizeProfilePayload(body.data);
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
    const body: APIResponsePayload<ProfilePayloadFlat | ProfilePayloadNested> =
        await res.json();
    if (body.status === "error") throw new Error(body.error);
    return normalizeProfilePayload(body.data);
}

export const profileService = { fetchProfile, updateProfile };
