import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { Node } from '../../app/models/Node';
import TreeNode from './treeNode';

interface Props{
    registrationEventId: string
    treeData: Node[]
}

export default observer(function Tree({treeData, registrationEventId}: Props) {



    return(
        <>
         <ul>
      {treeData.map((node) => (
        <TreeNode node={node} key={node.key} registrationEventId={registrationEventId} />
      ))}
    </ul>
        </>
    )
});