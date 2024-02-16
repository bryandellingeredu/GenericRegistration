
import { Button, Divider, Header, Icon, Segment, SegmentGroup } from 'semantic-ui-react';
import { useStore } from '../../stores/store';

interface Props {
    title: string
    header: string
    subHeader: string
    onYesClick: () => void
  }

export default function Confirmation({title, header, subHeader, onYesClick} : Props){
    const {modalStore} = useStore();
    const {closeModal} = modalStore;
return(
<>
    <Divider horizontal>
    <Header as="h1">
        <Icon name='warning' color='yellow' />     
      {title}
    </Header>
    </Divider>
    <SegmentGroup>
    <Segment color='yellow'>
    <Header as={'h2'} textAlign='center'>
            <Header.Content>
              {header}
            </Header.Content>
            <Header.Subheader>
            <h2>{subHeader} </h2> 
            </Header.Subheader>
        </Header>
    </Segment >
    <Segment clearing color='yellow'>
  <Button floated="left" primary onClick={closeModal} size='huge' content='Cancel' />
  <Button floated="right" secondary onClick={onYesClick} size='huge' content='Yes' />     
</Segment>
</SegmentGroup>
  </>
)
}