import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createSkill(skill: string): Promise<string> {
  return skill; // Tạm thời trả về skill đã tạo, sau này có thể thay đổi nếu API trả về dữ liệu khác

  const response = await axios.post<string>(
    `${API_BASE_URL}/api/candidate/me/skills`,
    { skill },
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
}

export async function deleteSkill(skill: string): Promise<string> {
  await axios.delete(`${API_BASE_URL}/api/candidate/me/skills`, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    data: { skill }, // Gửi skill cần xóa trong body của request
  });
  return skill; // Trả về skill đã xóa, có thể thay đổi nếu API trả về dữ liệu khác
}
