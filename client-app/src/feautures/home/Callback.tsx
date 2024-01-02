import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import LoadingComponent from '../../app/layout/LoadingComponent';


const Callback = observer(() => {
    const { userStore,  } = useStore();

    useEffect(() => {
        userStore.handleCallback().then(() => {})
    }, []);

    return (
     <LoadingComponent content='Logging In...'/>
    )
});

export default Callback;