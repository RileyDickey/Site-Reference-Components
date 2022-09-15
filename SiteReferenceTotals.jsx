import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, Dropdown, Row, Col } from 'react-bootstrap';
import * as siteReferenceService from '../services/siteReferenceService';
import debug from 'sabio-debug';
import toastr from 'toastr';

const SiteReferenceTotals = () => {
    const _logger = debug.extend('SiteRefTotals');
    const [siteRefs, setSiteRefs] = useState({
        siteRefComponents: [],
        siteRefData: [],
        colors: ['rgba(114, 124, 245, 0.85)'],
    });
    useEffect(() => {
        siteReferenceService.getSummary().then(onGetSiteRefTotalsSuccess).catch(onGetSiteRefTotalsError);
    }, []);

    const onGetSiteRefTotalsError = (err) => {
        toastr.error('Unable to Receive Totals');
        _logger(err, 'get summary failed');
    };

    const onGetSiteRefTotalsSuccess = (response) => {
        let referenceArray = response.items;
        setSiteRefs((prevState) => {
            const clone = { ...prevState };
            clone.referenceArray = referenceArray;
            clone.siteRefComponents = referenceArray.map((item) => item.name);
            clone.siteRefData = referenceArray.map((item) => item.totalCount);
            return clone;
        });
    };

    const apexBarChartOpts = {
        grid: {
            padding: {
                left: 0,
                right: 15,
            },
        },
        chart: {
            type: 'bar',
            height: 350,
            parentHeightOffset: 0,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
            },
        },
        colors: siteRefs.colors,
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: siteRefs.siteRefComponents,
            labels: {
                formatter: function (val) {
                    return val + '';
                },
            },
        },
    };
    const apexBarChartData = [
        {
            name: 'Sessions',
            data: siteRefs.siteRefData,
        },
    ];

    return (
        <React.Fragment>
            <Card>
                <Card.Body>
                    <Dropdown className="float-end" align="end">
                        <Dropdown.Toggle variant="link" className="arrow-none card-drop p-0 shadow-none">
                            <i className="mdi mdi-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>Refresh Report</Dropdown.Item>
                            <Dropdown.Item>Export Report</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <h4 className="header-title">Sessions Overview</h4>

                    <Row>
                        <Col lg={4}>
                            <Chart options={apexBarChartOpts} series={apexBarChartData} type="bar" height={320} />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </React.Fragment>
    );
};

export default SiteReferenceTotals;
