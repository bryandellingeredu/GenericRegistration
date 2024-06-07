import { useState } from 'react';
import { Button, Header, Segment, SegmentGroup } from 'semantic-ui-react';

export default function CUIWarningModal() {
  const [showCUIInfo, setShowCUIInfo] = useState(false);
  return (
    <>
      <SegmentGroup>
        <Segment>
          <h3>
            {' '}
            Operations Security (OPSEC) is a process of identifying critical
            information and subsequently analyzing friendly actions attendant to
            military operations. Determine indicators that hostile intelligence
            systems might obtain that could be interpreted or pieced together to
            derive critical information in time to be useful to adversaries.
            Select and execute measures that eliminate or reduce to an
            acceptable level the vulnerabilities of friendly actions to
            adversary exploitation.
          </h3>
        </Segment>
        <Segment>
          <h3>
            PII is information that can be used to distinguish or trace
            someone's identity. It includes information such as social security
            number, age, military rank or civilian grade, home and office
            numbers, birthdays, spouse name, marital status, educational history
            and medical records.
          </h3>
        </Segment>
        <Segment>
          {!showCUIInfo && (
            <Button basic color="blue" onClick={() => setShowCUIInfo(true)}>
              Show More Information About CUI and PII{' '}
            </Button>
          )}
          {showCUIInfo && (
            <Button basic color="blue" onClick={() => setShowCUIInfo(false)}>
              Show Less Information About CUI and PII{' '}
            </Button>
          )}
        </Segment>
      </SegmentGroup>

      {showCUIInfo && (
        <SegmentGroup>
          <Segment>
            <Header
              as={'h1'}
              textAlign="center"
              content="Controlled Unclassified Information (CUI) Event"
            />
          </Segment>
          <Segment>
            Government created or owned UNCLASSIFIED information that must be
            safeguarded from unauthorized disclosure. An overarching term
            representing many difference categories, each authorized by one or
            more law, regulation, or Government-wide policy. Information
            requiring specific security measures indexed under one system across
            the Federal Gov't
          </Segment>
          <Segment>
            <Header
              as={'h3'}
              textAlign="center"
              content="Personally Identiifiable Information (PII)"
            />
            Uses data to confirm an individual's identity. Sensitive personally
            identifiable information can include your full name, address,
            telephone #, email address, Social Security Number, driver's
            license, financial information or credit card number, Department of
            Defense Identification (ID) number, and medical records. What is not
            an example of PII? Info such as business phone numbers and race,
            religion, gender, workplace, and job titles are typically not
            considered PII.
          </Segment>
          <Segment>
            <Header
              as={'h3'}
              textAlign="center"
              content="Sensitive Personally Identifiable Information (SPII)"
            />
            <ol>
              <li>
                A subset of PII that, if lost, compromised, or disclosed without
                authorization could result in substantial harm, embarrassment,
                inconvenience, or unfairness to an individual. Some forms of PII
                are sensitive as stand-alone elements.
              </li>
              <li>
                {' '}
                Examples of stand-alone PII include Social Security Numbers
                (SSN), driver's license or state identification number; Alien
                Registration Numbers; financial account number; and biometric
                identifiers such as fingerprint, voiceprint, or iris scan.
              </li>
              <li>
                Additional examples of SPII include any groupings of information
                that contain an individual's name or other unique identifier
                plus one or more of the following elements:
                <ol>
                  <li>Truncated SSN (such as last four digits)</li>
                  <li>Date of birth (month, day, and year)</li>
                  <li>Citizenship or immigration status</li>
                  <li>Ethnic or religious affiliation</li>
                  <li>Sexual orientation</li>
                  <li>Criminal history</li>
                  <li>Medical information</li>
                  <li>Medical information</li>
                  <li>
                    System authentication information such as mother's maiden
                    name, account passwords, or personal identification numbers
                  </li>
                </ol>
              </li>
            </ol>
          </Segment>
          <Segment>
            <Header
              as={'h3'}
              textAlign="center"
              content="Unclassified Controlled Technical Information (UCTI)"
            />
          </Segment>
          <Segment>
            <Header
              as={'h3'}
              textAlign="center"
              content="Sensitive but Unclassified (SBU)"
            />
            is a designation of information in the United States federal
            government that, though unclassified, often requires strict controls
            over its distribution. SBU is a broad category of information that
            includes material covered by such designations as For Official Use
            Only (FOUO), Law Enforcement Sensitive (LES), Sensitive Homeland
            Security Information, Sensitive Security Information (SSI), Critical
            Infrastructure Information (CII), etc.
          </Segment>
          <Segment>
            <Header
              as={'h3'}
              textAlign="center"
              content="For Official Use Only (FOUO)"
            />
             Department of Defense recently released changed from "For Official
            Use Only" labeling to "Controlled Unclassified Information.""
          </Segment>
          <Segment>
            <Header
              as={'h3'}
              textAlign="center"
              content="Law Enforcement Sensitive (LES), and others."
            />
          </Segment>
        </SegmentGroup>
      )}
    </>
  );
}
