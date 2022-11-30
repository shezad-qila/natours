class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        const queryObj = {...this.queryString};
        const execludedFields=['page','limit','sort','fields'];
        execludedFields.forEach(el => delete queryObj[el]);

        // 1(B) advance filter
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match => `$${match}`);
        
        // Build query
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort(){
        if(this.queryString.sort){
            const Sort = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(Sort);
        }else{
            this.query = this.query.sort('createdAte');
        }
        return this;
    }

    limitFields(){
        if(this.queryString.fields){
            const Fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(Fields);
        }else{
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination(){
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;
        const skip = (page-1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;