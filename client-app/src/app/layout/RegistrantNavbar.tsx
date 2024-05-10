import { useEffect, useState} from 'react';
import { Dropdown, Icon, Menu, Sidebar } from 'semantic-ui-react';
import ArmyLogo from '../../feautures/home/ArmyLogo';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';
import { NavLink, useNavigate} from 'react-router-dom';

export default observer(function RegistrantNavbar() {
    const navigate = useNavigate();
    const { responsiveStore, userStore } = useStore();
    const {isMobile} = responsiveStore
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const { logout, user } = userStore;


    return (
      <>
      {isMobile ? (
        <div style={{ width: '100%', backgroundColor: 'grey' }}>
          <Menu inverted color='grey' style={{ width: '100%', display: 'flex' }}>
            <Menu.Item onClick={() => setSidebarVisible(true)} style={{ flexShrink: 0 }}>
              <Icon name="sidebar" />
            </Menu.Item>
            <Menu.Item style={{ flexGrow: 1, justifyContent: 'center', display: 'flex' }}>
              <ArmyLogo content='REGISTRATION PORTAL' size="1em" textColor="#FFF" outerStarColor="yellow" innerStarColor="grey" />
            </Menu.Item>
            {user && 
            <Menu.Item style={{ flexShrink: 0 }}>
              <Dropdown trigger={
              <>
              {user?.roles && user?.roles.includes('Administrators') ?
               <Icon name="user plus" color='olive'/> :  <Icon name="user" />
               }
              
               {user?.displayName}</>}>
                <Dropdown.Menu>
                {user?.roles && user?.roles.includes('Administrators') &&
                  <Dropdown.Item icon="user plus" text="Manage Admins"
                    onClick={() => navigate('/manageAdmins')} />
                }
                  <Dropdown.Item icon="power" text="Logout" onClick={logout} />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
           }
          </Menu>
          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            inverted
            onHide={() => setSidebarVisible(false)}
            vertical
            visible={sidebarVisible}
            width='thin'
          >
            <Menu.Item as={NavLink} to='/'>Home</Menu.Item>
            <Menu.Item as={NavLink} to='/viewallevents'>View All Events</Menu.Item>
            {/* Add other menu items here */}
          </Sidebar>
        </div>
      ) : (
        <div style={{ width: '100%', backgroundColor: 'grey' }}>
          <Menu inverted color='grey' style={{ width: '100%' }}>
            <Menu.Item as={NavLink} to='/'>
              <ArmyLogo content='REGISTRATION PORTAL' size="1.7em" textColor="#FFF" outerStarColor="yellow" innerStarColor="grey" />
            </Menu.Item>
            <Menu.Item as={NavLink} to='/viewallevents'>View All Events</Menu.Item>
            {user && 
            <Menu.Item position="right">
              <Dropdown trigger={<>
                {user?.roles && user?.roles.includes('Administrators') ?
               <Icon name="user plus" color='olive'/> :  <Icon name="user" />
               }
               {user?.displayName}
              </>}>
                <Dropdown.Menu>
                {user?.roles && user?.roles.includes('Administrators') &&
                  <Dropdown.Item icon="user plus" text="Manage Admins"
                    onClick={() => navigate('/manageAdmins')} />
                }
                  <Dropdown.Item icon="power" text="Logout" onClick={logout} />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
           }
          </Menu>
        </div>
      )}
    </>
    );
});
