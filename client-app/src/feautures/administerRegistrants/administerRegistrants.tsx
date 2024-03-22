import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { RegistrationEvent } from '../../app/models/registrationEvent';
import agent from '../../app/api/agent';
import { toast } from 'react-toastify';
import LoadingComponent from '../../app/layout/LoadingComponent';
import { useNavigate } from "react-router-dom";
import ManageRegistrationNavbar from '../../app/layout/ManageRegistrationNavbar';

export default observer(function AdministerRegistrants() {
    return(
        <>
          <ManageRegistrationNavbar />
        </>
    )
});