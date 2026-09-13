export const demoDocuments = [
  {name:'Employment Agreement.pdf', date:'10 Sep 2026', size:'1.2 MB', risk:'Medium Risk', riskTone:'medium'},
  {name:'NDA - Acme Corp.pdf', date:'8 Sep 2026', size:'0.8 MB', risk:'Low Risk', riskTone:'low'},
  {name:'Service Contract - Client A.pdf', date:'5 Sep 2026', size:'1.5 MB', risk:'High Risk', riskTone:'high'},
  {name:'Vendor Agreement.pdf', date:'2 Sep 2026', size:'0.9 MB', risk:'Medium Risk', riskTone:'medium'},
]

export const analysis = {
  overallRisk:'Medium',
  summary:'This is an employment agreement between ABC Pvt. Ltd. and the employee. It outlines the terms of employment, including compensation, job responsibilities, confidentiality, intellectual property rights, and termination conditions.',
  parties:['ABC Pvt. Ltd. (Employer)','Employee (You)'],
  type:'Employment Agreement', effective:'1 Oct 2026', duration:'3 years',
  takeaways:['You will be employed as a Software Engineer.','Your annual compensation is ₹12,00,000 (CTC).','You must keep company information confidential.','There is a non-compete clause for 12 months after leaving.'],
  risks:[['Compensation','Low'],['Termination','Medium'],['Non-compete','High'],['Confidentiality','Medium'],['IP Ownership','Medium']]
}
