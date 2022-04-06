import { LightningElement,api } from 'lwc';

export default class CustomSectionHeaderLWC extends LightningElement {
    @api headerName;
    @api subHeader;
    @api title;
}