import { observer } from "mobx-react-lite";
import { Button, Divider, Form, FormField, FormGroup, Grid, Input, Radio } from "semantic-ui-react";

interface Props{
    registrationEventId : string
    searchFilter: string
    setSearchFilter: (newSearchFilter: string) => void
    showQuestions: boolean
    showTable: boolean
    setShowQuestions: (newShowQuestions : boolean) => void
    setShowTable: (newShowTable : boolean) => void
}
export default observer(function AdministerRegistrantsFilter(
    {searchFilter, setSearchFilter, showQuestions, showTable, setShowQuestions, setShowTable, registrationEventId} : Props
){

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchFilter(e.target.value);
    };

    const handleShowQuestionsChange = () => {
        setShowQuestions(!showQuestions)
    }

    const handleShowTableChange = () => {
        setShowTable(!showTable)
    }

    const handleExportToExcel = () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = `${apiUrl}/ExportToExcel/${registrationEventId}`
        fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          })
            .then(res => res.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(new Blob([blob]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "registrations.csv");
              document.body.appendChild(link);
              link.click();
            });
        }
    

    return(


<Form style={{ marginLeft: '40px', marginRight: '40px' }}>
    <Grid stackable>
        <Grid.Row columns={2}>
            <Grid.Column width={4}>
                <Form.Field>
                    <Input
                        icon='search'
                        placeholder='Search...'
                        value={searchFilter}
                        onChange={handleSearchInputChange} />
                </Form.Field>
            </Grid.Column>
            <Grid.Column width={3}>
                <Form.Field>
                    <Radio
                        style={{ marginTop: '7px' }}
                        toggle
                        label={showQuestions ? 'Questions Are Shown' : 'Questions Are Hidden'}
                        checked={showQuestions}
                        onChange={handleShowQuestionsChange}
                    />
                </Form.Field>
            </Grid.Column>
            <Grid.Column width={2}>
                <Form.Field>
                    <Radio
                        style={{ marginTop: '7px' }}
                        toggle
                        label={showTable ? 'Table View' : 'Card View'}
                        checked={showTable}
                        onChange={handleShowTableChange}
                    />
                </Form.Field>
            </Grid.Column>
            <Grid.Column width={2}>
                <Form.Field>
                    <Button color='teal' content='Export to Excel'  onClick={handleExportToExcel}/>
                </Form.Field>
            </Grid.Column>
        </Grid.Row>
    </Grid>
    <Divider />
</Form>
    )
})