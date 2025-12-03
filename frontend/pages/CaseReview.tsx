
import { useParams } from 'react-router-dom';

const CaseReview = () => {
  const { id } = useParams();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Case Review: {id}</h1>
      <p>Details for case {id} will appear here.</p>
    </div>
  );
};

export default CaseReview;
