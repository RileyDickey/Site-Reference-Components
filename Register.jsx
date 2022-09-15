import React, { useState, useEffect } from 'react';
import AccountLayout from './AccountLayout';
import userService from '../../services/userService';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import debug from 'sabio-debug';
import { useTranslation } from 'react-i18next';
import { Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Formik.css';
import registerSchema from '../../schemas/registerSchema';
import Swal from 'sweetalert2';
import TermsOfService from '../landing/TermsOfService.jsx';
import * as siteReferenceService from '../../services/siteReferenceService';
import toastr from 'toastr';
import GoogleLogin from '../../components/GoogleLogin';
import {FcGoogle} from 'react-icons/fc';
import Facebook from '../../components/facebook/Facebook';
import { FaFacebookSquare } from 'react-icons/fa';

const userRoles = [
    {
        id: 1,
        name: 'User',
    },
    {
        id: 4,
        name: 'Organization',
    },
    {
        id: 5,
        name: 'Subcontractor',
    },
    {
        id: 6,
        name: 'OrgAdmin',
    },
    {
        id: 7,
        name: 'Employee',
    },
];

function Register() {
    const _logger = debug.extend('Register');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [userFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        agreeTerms: false,
        newRefType: '',
    });

    const [showThirdParty, updateShowThirdParty] = useState(false);
    const [refTypes, setRefTypes] = useState([]);
    const [roles, updateRoles] = useState([]);

    const [selection, setSelection] = useState({ id: null, name: null });
    const [roleSelection, setRoleSelection] = useState({ id: null, name: null });

    useEffect(() => {
        siteReferenceService.getRefs().then(onGetRefTypesSuccess).catch(onGetRefTypesError);
        updateRoles(userRoles);
    }, []);

    const otherSelection = () => {
        return (
            <div className="mt-3">
                <Field
                    label={t('Other')}
                    type="text"
                    name="newRefType"
                    placeholder="Enter Reference Name"
                    className="form-control"
                />
            </div>
        );
    };

    const addRefType = otherSelection();

    const [modal, setModal] = useState({
        show: false,
    });

    const BottomLink = () => {
        const { t } = useTranslation();
        return (
            <Row className="mt-3">
                <Col className="text-center">
                    <p className="text-muted">
                        {t('Already have account?')}
                        <Link to={'/login'} className="text-muted ms-1">
                            <b>{t('Log In')}</b>
                        </Link>
                    </p>
                </Col>
            </Row>
        );
    };

    const renderModal = () => {
        return (
            <React.Fragment>
                <Modal show={modal.show}>
                    <ModalHeader>Terms and Conditions</ModalHeader>
                    <ModalBody>
                        <TermsOfService></TermsOfService>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" color onClick={onClickCloseModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        );
    };

     const onClickTerms = () => {
        setModal((prevState) => {
            let md = { ...prevState };
            md.show = true;
            return md;
        });
    };

    const onClickCloseModal = () => {
        setModal((prevState) => {
            let newState = { ...prevState };
            newState.show = false;
            return newState;
        });
    };

    const handleSubmit = (values) => {
        let payload = values;
        let { agreeTerms, ...newPayload } = payload;
        newPayload.roleId = roleSelection.id;
        if (agreeTerms) {
            userService.register(newPayload).then(onRegisterSuccess).catch(onRegisterError);
        }
    };

    const onRegisterSuccess = (response) => {
        Swal.fire('Registration successful!', 'Please login', 'success');
        const selectedSiteRef = {};
        selectedSiteRef.referenceTypeId = selection.id;
        selectedSiteRef.userId = response.item;
        siteReferenceService.addSiteRef(selectedSiteRef).then(onSiteRefSuccess).catch(onSiteRefError);
    };

    const onRegisterError = (response) => {
        _logger('onRegisterError', response);
        Swal.fire('Registration failed!', 'Something went wrong', 'error');
    };

    const onSiteRefSuccess = (response) => {
        _logger('onSiteRefSuccess', response);
        navigate('/verify');
    };

    const onSiteRefError = (err) => {
        _logger(err, 'Error Submitting Site Ref');
        toastr.error('Unable to Submit Reference');
        navigate('/verify');
    };

    const onGetRefTypesSuccess = (response) => {
        setRefTypes(response.items);
    };

    const onGetRefTypesError = (err) => {
        toastr.error('Unable to Get Reference Types');
        _logger(err);
    };

    const refDropdownMapper = (ref) => {
        return (
            <Dropdown.Item
                key={ref.id}
                onClick={() => {
                    setSelection(ref);
                }}>
                {ref.name}
            </Dropdown.Item>
        );
    };

    const dropdownItems = refTypes.map(refDropdownMapper);

    const isReferenceNotFilled = () => {
        if (selection.name === null && userFormData.newRefType === '') {
            return true;
        } else if (roleSelection.name === null) {
            return true;
        } else {
            return false;
        }
    };

    const rolesDropdownMapper = (role) => {
        return (
            <Dropdown.Item
                key={`role_${role.id}`}
                onClick={() => {
                    setRoleSelection(role);
                }}>
                {role.name}
            </Dropdown.Item>
        );
    };

    const rolesItems = roles.map(rolesDropdownMapper);

    const onRegisterWithGoogleClick = () => {
        updateShowThirdParty(!showThirdParty)
    }

    const onGoogleRegisterClick = (gData) => 
    {
        const registerData = 
        {
            email: gData.profileObj.email,
            accessToken: gData.accessToken,
            tokenType: 4,
            roleId: roleSelection.id
        }
        userService.googleRegister(registerData).then(onRegisterSuccess).catch(onRegisterError)
    }

    const onFacebookRegisterClick = (fbData) => 
    {
        _logger(fbData)
        const registerData = 
        {
            email: fbData.email,
            accessToken: fbData.accessToken,
            tokenType: 3,
            roleId: roleSelection.id
        }
       userService.fbRegister(registerData).then(onRegisterSuccess).catch(onRegisterError)
    }

    return (
        <React.Fragment>
            {showThirdParty === false ? <AccountLayout bottomLinks={<BottomLink />}>
                <div className="text-center w-75 m-auto">
                    <h4 className="text-dark-50 text-center mt-0 fw-bold">{t('Register')}</h4>
                    <p className="text-muted mb-4">
                        {t("Don't have an account? Create one, it takes less than a minute.")}
                    </p>
                </div>
                <div className="modal-container">{modal.show && renderModal()}</div>
                <Formik
                    enableReinitialize={true}
                    initialValues={userFormData}
                    onSubmit={handleSubmit}
                    validationSchema={registerSchema}>
                    <Form className="">
                        <div className="mb-3">
                            <label htmlFor="email">Email</label>
                            <Field
                                label={t('Email address')}
                                type="text"
                                name="email"
                                placeholder="Enter your email"
                                className="form-control"
                            />
                            <ErrorMessage name="email" component="div" className="has-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password">Password</label>
                            <Field
                                label={t('Password')}
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                className="form-control"
                            />
                            <ErrorMessage name="password" component="div" className="has-error" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="passwordConfirm">Confirm Password</label>
                            <Field
                                type="password"
                                name="passwordConfirm"
                                placeholder="Confirm your password"
                                className="form-control"
                            />
                            <ErrorMessage name="passwordConfirm" component="div" className="has-error" />
                        </div>
                        <h4>Please select an account type</h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="col-12">
                                {roleSelection.name !== null ? roleSelection.name : 'Select One'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="col-12">{rolesItems}</Dropdown.Menu>
                        </Dropdown>
                        <h4>Tell us how you heard about us!</h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="success" id="dropdown-basic" className="col-12">
                                {selection.name !== null ? selection.name : 'Select One'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="col-12">{dropdownItems}</Dropdown.Menu>
                        </Dropdown>

                        <div>{selection.name === 'Other' ? addRefType : null}</div>

                        <div className="card-body">
                            <div className="mb-3 text-muted">
                                <Field type="checkbox" name="agreeTerms" />
                                <label className="ms-1">
                                    {t('I accept the')}
                                    <button type="button" className="btn btn-link" onClick={onClickTerms}>
                                        Terms and Conditions
                                    </button>
                                </label>
                            </div>
                            <div className="mt-2 text-center">
                                <Button variant="primary" type="submit" disabled={isReferenceNotFilled()}>
                                    {t('Register')}
                                </Button>
                            </div>
                            <Row className="mt-2 text-center">
                                <Col>
                                    <Button
                                        variant='light'
                                        type='button'
                                        className='btn text-dark'
                                        onClick={onRegisterWithGoogleClick}
                                        ><FcGoogle/> Register with Google
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        variant='light'
                                        type='button'
                                        className='btn text-dark'
                                        onClick={onRegisterWithGoogleClick}
                                        ><FaFacebookSquare/> Register with Facebook
                                    </Button>
                                </Col>
                            </Row>
                        </div>                        
                    </Form>
                </Formik>
            </AccountLayout> :
            <AccountLayout bottomLinks={<BottomLink />}>
            <div className="text-center w-75 m-auto">
                <h4 className="text-dark-50 text-center mt-0 fw-bold">{t('Register')}</h4>
                <p className="text-muted mb-4">
                    {t("Don't have an account? Create one, it takes less than a minute.")}
                </p>
            </div>
            <div className="modal-container">{modal.show && renderModal()}</div>
            <Formik
                enableReinitialize={true}
                initialValues={userFormData}
                onSubmit={handleSubmit}
                validationSchema={registerSchema}>
                <Form className="">                    
                    <h4>Please select an account type</h4>
                    <Dropdown>
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="col-12">
                            {roleSelection.name !== null ? roleSelection.name : 'Select One'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="col-12">{rolesItems}</Dropdown.Menu>
                    </Dropdown>
                    <h4>Tell us how you heard about us!</h4>
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className="col-12">
                            {selection.name !== null ? selection.name : 'Select One'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="col-12">{dropdownItems}</Dropdown.Menu>
                    </Dropdown>
                    <div>{selection.name === 'Other' ? addRefType : null}</div>
                    <div className="card-body">
                        <div className="mb-3 text-muted">
                            <Field type="checkbox" name="agreeTerms" />
                            <label className="ms-1">
                                {t('I accept the')}
                                <button type="button" className="btn btn-link" onClick={onClickTerms}>
                                    Terms and Conditions
                                </button>
                            </label>
                        </div>                        
                        <Row className="mt-2 text-center">
                            <Col>
                                <Button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onRegisterWithGoogleClick}
                                    >Go Back
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    <Row className="mt-2 text-center">
                        <Col>
                            <GoogleLogin 
                            buttonText="Register"
                            onClick={onGoogleRegisterClick}
                            isDisabled={selection.name === null && userFormData.newRefType === '' ? true : false || roleSelection.name === null ? true : false}
                            />
                        </Col>
                        <Col>
                            <Facebook 
                                buttonText='Register'
                                onClick={onFacebookRegisterClick}
                            />
                        </Col>
                    </Row>
                </Form>
            </Formik>
        </AccountLayout>}
        </React.Fragment>
    );
}

export default Register;
