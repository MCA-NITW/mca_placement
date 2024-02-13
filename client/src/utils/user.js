import { jwtDecode } from 'jwt-decode';
import { getStudent } from '../api/studentApi';
import { getAuthToken } from './auth';
const getUser = async () => {
	const token = await getAuthToken();
	try {
		const decodedToken = jwtDecode(token);
		const user = await getStudent(decodedToken.id);
		user.data.id = decodedToken.id;
		return user.data;
	} catch (error) {
		console.error('Error decoding token:', error.message);
		return null;
	}
};

export default getUser;
