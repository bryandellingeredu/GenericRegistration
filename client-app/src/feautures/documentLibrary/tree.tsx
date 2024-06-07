import { observer } from 'mobx-react-lite';
import { Node } from '../../app/models/Node';
import TreeNode from './treeNode';

interface Props {
  registrationEventId: string;
  treeData: Node[];
  isAdmin: boolean;
  encryptedKey?: string;
}

export default observer(function Tree({
  treeData,
  registrationEventId,
  isAdmin,
  encryptedKey,
}: Props) {
  return (
    <>
      <ul>
        {treeData.map((node) => (
          <TreeNode
            node={node}
            key={node.key}
            registrationEventId={registrationEventId}
            isAdmin={isAdmin}
            encryptedKey={encryptedKey}
          />
        ))}
      </ul>
    </>
  );
});
