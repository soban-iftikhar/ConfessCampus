import { useNavigate, useParams } from 'react-router-dom';
import ReportModal from '../components/ReportModal';

const ReportPage = () => {
  const navigate = useNavigate();
  const { itemType, itemId } = useParams();

  return (
    <ReportModal
      itemId={itemId}
      itemType={itemType === 'post' ? 'Post' : itemType === 'comment' ? 'Comment' : itemType}
      onClose={() => navigate(-1)}
    />
  );
};

export default ReportPage;
