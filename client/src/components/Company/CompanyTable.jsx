import { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { MdDelete, MdEdit } from 'react-icons/md';
import { toast } from 'react-toastify';
import { addCompany, deleteCompany, getCompanies, getCompany, updateCompany } from '../../api/companyApi.jsx';
import getUser from '../../utils/user.js';
import AgGridTable from '../AgGridTable/AgGridTable.jsx';
import Modal from '../Modal/Modal.jsx';
import ToastContent from '../ToastContent/ToastContent.jsx';
import CompanyForm from './CompanyForm';
import './CompanyTable.css';

const CompanyTable = () => {
	const [companies, setCompanies] = useState([]);
	const [companyData, setCompanyData] = useState(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isAdd, setIsAdd] = useState(false);
	const user = getUser();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [companyToDelete, setCompanyToDelete] = useState(null);
	const closeModal = () => setIsModalOpen(false);

	const fetchData = useCallback(async () => {
		try {
			const response = await getCompanies();
			setCompanies(response.data);
		} catch (error) {
			console.error('Error fetching companies:', error);
		}
	}, []);

	const handleDeleteButtonClick = (company) => {
		setIsModalOpen(true);
		setCompanyToDelete(company);
	};

	const onConfirmDelete = async () => {
		try {
			await deleteCompany(companyToDelete.id);
			toast.success(<ToastContent res="success" messages={[`Company ${companyToDelete.name} deleted successfully.`]} />);
			setIsModalOpen(false);
			fetchData();
		} catch (error) {
			console.error('Error deleting company:', error);
		}
	};

	const handleEditButtonClick = async (id) => {
		setIsAdd(false);
		const response = await getCompany(id);
		setCompanyData(response.data);
		setIsFormOpen(true);
	};

	const generateColumn = (field, headerName, width, pinned = null, sortable = true, resizable = true, cellRenderer = null) => ({
		field,
		headerName,
		width,
		pinned,
		sortable,
		resizable,
		cellRenderer
	});

	const generateNestedColumn = (headerName, children) => ({
		headerName,
		children
	});

	const formatCutoff = (cutoff) => (cutoff.cgpa ? `${cutoff.cgpa} CGPA` : `${cutoff.percentage}%`);

	const deleteButtonRenderer = (params) => {
		return (
			<button className="btn--icon--del" onClick={() => handleDeleteButtonClick(params.data)}>
				<MdDelete />
			</button>
		);
	};

	const editButtonRenderer = (params) => {
		return (
			<button className="btn--icon--edit" onClick={() => handleEditButtonClick(params.data.id)}>
				<MdEdit />
			</button>
		);
	};

	const actionsColumn = generateNestedColumn('Actions', [
		generateColumn(null, 'Delete', 55, 'left', false, false, deleteButtonRenderer),
		generateColumn(null, 'Edit', 55, 'left', false, false, editButtonRenderer)
	]);

	const columnDefinitions = [
		...(user.role === 'admin' || user.role === 'placementCoordinator' ? [actionsColumn] : []),
		generateColumn('name', 'Name', 150, 'left'),
		generateColumn('status', 'Status', 100, null, false),
		generateColumn('typeOfOffer', 'Offer', 90),
		generateColumn('profile', 'Profile', 150),
		generateColumn('profileCategory', 'Category', 100),
		generateColumn('interviewShortlist', 'Shortlists', 120),
		generateColumn('selectedStudents', 'Selects', 100),
		generateColumn('dateOfOffer', 'Offer Date', 125, null, true, false, (params) =>
			params.value ? new Date(params.value).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
		),
		generateColumn('locations', 'Locations', 130),
		generateNestedColumn('CTC (LPA)', [
			generateColumn('ctc', 'CTC', 80, null, true, false, (params) => params.value.toFixed(2)),
			generateColumn('ctcBase', 'Base', 80, null, true, false, (params) => params.value.toFixed(2))
		]),
		generateNestedColumn('Cutoffs', [
			generateColumn('cutoff_pg', 'PG', 80, null, false, false),
			generateColumn('cutoff_ug', 'UG', 80, null, false, false),
			generateColumn('cutoff_12', '12', 80, null, false, false),
			generateColumn('cutoff_10', '10', 80, null, false, false)
		]),
		generateColumn('bond', 'Bond', 60, null, false, false)
	];

	const mapCompanyData = (company) => ({
		...company,
		id: company._id,
		selectedStudents: company.selectedStudentsRollNo.length,
		cutoff_pg: formatCutoff(company.cutoffs.pg),
		cutoff_ug: formatCutoff(company.cutoffs.ug),
		cutoff_12: formatCutoff(company.cutoffs.twelth),
		cutoff_10: formatCutoff(company.cutoffs.tenth),
		ctcBase: company.ctcBreakup.base
	});

	const rowData = companies.map(mapCompanyData);

	const handleAddCompanyClick = () => {
		setIsAdd(true);
		setCompanyData(null);
		setIsFormOpen(true);
	};

	const handleCloseForm = (fetch) => {
		setIsFormOpen(false);
		if (fetch) fetchData();
	};

	const renderCompanyForm = () => {
		if (!isFormOpen) return null;
		return ReactDOM.createPortal(
			<CompanyForm actionFunc={isAdd ? addCompany : updateCompany} initialData={companyData} handleFormClose={handleCloseForm} isAdd={isAdd} />,
			document.getElementById('form-root')
		);
	};

	return (
		<>
			{(user.role === 'admin' || user.role === 'placementCoordinator') && (
				<button className="btn btn-primary" onClick={handleAddCompanyClick}>
					Add Company
				</button>
			)}
			{renderCompanyForm()}
			<AgGridTable rowData={rowData} columnDefinitions={columnDefinitions} fetchData={fetchData} />
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				onConfirm={onConfirmDelete}
				message="Are you sure you want to delete this company?"
				buttonTitle="Delete"
			/>
		</>
	);
};

export default CompanyTable;
